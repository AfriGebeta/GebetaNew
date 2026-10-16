"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
    AnimatePresence,
    motion,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useTransform,
    type MotionValue,
} from "motion/react";
import type { GebetaMaps } from "@gebeta/js";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
// The ESM build of @gebeta/js does not inject MapLibre's stylesheet (only the UMD bundle does).
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { tokenColor } from "@/lib/tokens";
import { SPRING, STAGGER } from "@/lib/motion";
import { ADDIS_CENTER, FALLBACK_STREETS, MAP_STYLES, PLACES, type LngLat, type Place } from "@/constants/landing";
import { ALL_DEMO_ROUTES } from "@/constants/demo-routes";
import { proxiedTileUrl } from "./demo-api";
import { applySoftPalette } from "./soft-palette";
import { boundsOf, projector, sliceRoute } from "./geo";
import { IconPin, NumberedStop, OriginGlyph, PinGlyph, PuckGlyph, StopGlyph } from "./markers";

export type MapMode = "loading" | "live" | "fallback";

export type MapStop = Place & { label?: string; title?: string };

export type MapScene = {
    origin?: Place | null;
    target?: Place | null;
    route?: LngLat[] | null;
    routes?: LngLat[][] | null;
    stops?: MapStop[] | null;
    originIcon?: ComponentType<{ className?: string }>;
};

type RouteTone = "primary" | "muted";

type LiveMapProps = {
    scene: MapScene;
    progress: MotionValue<number>;
    styleUrl?: string;
    zoom?: number;
    drift?: boolean;
    showLabels?: boolean;
    tone?: RouteTone;
    controls?: boolean;
    soft?: boolean;
    overlayInset?: Partial<Record<"top" | "right" | "bottom" | "left", number>>;
    onModeChange?: (mode: MapMode) => void;
    className?: string;
};

const ROUTE_SOURCE = "demo-route";
const CASING_LAYER = `${ROUTE_SOURCE}-casing`;
const LINE_LAYER = `${ROUTE_SOURCE}-line`;
const LOAD_TIMEOUT_MS = 10_000;
const FIT_PADDING_RATIO = 0.08;
const FIT_PADDING_MIN = 16;
const FIT_PADDING_MAX = 56;
const DRIFT_DEG_PER_SEC = 2;
const DRIFT_PITCH = 50;
const FOCUS_ZOOM = 16;
const FLY_MS = 1800;
const TITLE_ROOM = { top: 56, side: 48 };
const PIN_ROOM_TOP = 40;
const MAX_FIT_ZOOM = 15;
const GRADIENT_EDGE = 0.0005;

const TONE_TOKEN: Record<RouteTone, `--${string}`> = { primary: "--primary", muted: "--ds-soft" };

const featureCollection = (all: LngLat[][]) => ({
    type: "FeatureCollection" as const,
    features: all.map((coordinates) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates },
    })),
});

/**
 * The route is drawn by revealing a gradient along the full line (`line-progress`), not by re-uploading a
 * sliced line every frame: paint updates apply on the main thread in the same frame as the puck, so the
 * line and the marker can't drift apart.
 */
function revealed(color: string, t: number) {
    const clear = "rgba(0,0,0,0)";
    if (t <= 0) return ["interpolate", ["linear"], ["line-progress"], 0, clear, 1, clear];
    if (t >= 1) return ["interpolate", ["linear"], ["line-progress"], 0, color, 1, color];
    const edge = Math.min(1, t + GRADIENT_EDGE);
    return ["interpolate", ["linear"], ["line-progress"], 0, color, t, color, edge, clear, ...(edge < 1 ? [1, clear] : [])];
}

function addRouteLayers(map: MapLibreMap) {
    if (map.getSource(ROUTE_SOURCE)) return;
    map.addSource(ROUTE_SOURCE, { type: "geojson", data: featureCollection([]), lineMetrics: true });
    const layout = { "line-cap": "round", "line-join": "round" } as const;
    map.addLayer({ id: CASING_LAYER, type: "line", source: ROUTE_SOURCE, layout, paint: { "line-width": 10, "line-gradient": revealed("white", 0) as never } });
    map.addLayer({ id: LINE_LAYER, type: "line", source: ROUTE_SOURCE, layout, paint: { "line-width": 5, "line-gradient": revealed("white", 0) as never } });
}

function paintProgress(map: MapLibreMap, tone: RouteTone, t: number) {
    if (!map.getLayer(LINE_LAYER)) return;
    map.setPaintProperty(CASING_LAYER, "line-gradient", revealed(tokenColor("--card"), t));
    map.setPaintProperty(LINE_LAYER, "line-gradient", revealed(tokenColor(TONE_TOKEN[tone]), t));
}

export default function LiveMap({
    scene,
    progress,
    styleUrl,
    zoom = 12.5,
    drift = false,
    showLabels = true,
    tone = "primary",
    controls = true,
    soft = true,
    overlayInset,
    onModeChange,
    className,
}: LiveMapProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markerClass = useRef<typeof Marker | null>(null);
    const fixedMarkers = useRef<{ origin: Marker; pin: Marker; puck: Marker } | null>(null);
    const stopMarkers = useRef(new Map<string, { marker: Marker; el: HTMLElement }>());
    const [markerEls, setMarkerEls] = useState<{ origin: HTMLElement; pin: HTMLElement; puck: HTMLElement } | null>(null);
    const [stopEls, setStopEls] = useState<{ id: string; el: HTMLElement; index: number }[]>([]);
    const [mode, setMode] = useState<MapMode>("loading");
    const reduceMotion = useReducedMotion();
    const userMoved = useRef(false);
    const framedTarget = useRef<string | undefined>(undefined);
    const nearView = useInView(rootRef, { once: true, margin: "200px" });
    const onModeChangeRef = useRef(onModeChange);
    onModeChangeRef.current = onModeChange;

    useEffect(() => onModeChangeRef.current?.(mode), [mode]);

    const { origin, target, route, routes, stops } = scene;
    const allRoutes = useMemo(() => [route, ...(routes ?? [])].filter((r): r is LngLat[] => !!r?.length), [route, routes]);

    useEffect(() => {
        if (!nearView) return;
        let cancelled = false;
        let map: MapLibreMap | null = null;
        const fallback = () => {
            if (cancelled) return;
            map?.remove();
            map = null;
            mapRef.current = null;
            setMode("fallback");
        };

        (async () => {
            const [{ GebetaMaps }, maplibre] = await Promise.all([import("@gebeta/js"), import("maplibre-gl")]);
            if (cancelled || !containerRef.current) return;

            // The key lives on our server: the SDK renders the map, and every tile request is rewritten
            // to the /api/map/tiles proxy, which adds the key.
            const sdk = new GebetaMaps({ apiKey: "proxied" });
            map = sdk.init({
                container: containerRef.current,
                center: ADDIS_CENTER,
                zoom,
                styleUrl: proxiedTileUrl(styleUrl ?? MAP_STYLES[0].url),
                // Pannable and zoomable by drag, pinch, double-click and the +/- buttons; the scroll
                // wheel stays with the page so the map never traps scrolling.
                dragPan: true,
                touchZoomRotate: true,
                doubleClickZoom: true,
                scrollZoom: false,
                dragRotate: false,
                pitchWithRotate: false,
            } as Parameters<GebetaMaps["init"]>[0]) as unknown as MapLibreMap;
            if (controls) map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
            const markInteraction = (e: { originalEvent?: unknown }) => {
                if (e.originalEvent) userMoved.current = true;
            };
            map.on("dragstart", markInteraction);
            map.on("zoomstart", markInteraction);
            map.setTransformRequest((url: string) => ({ url: proxiedTileUrl(url) }));
            mapRef.current = map;

            // Only a style that never arrives (proxy down, no key) is fatal. Missing tiles or glyphs
            // (the tile server 404s some fonts) fire errors too, but the map still renders.
            let styleArrived = false;
            map.on("error", () => {
                if (!styleArrived) fallback();
            });
            const timeout = window.setTimeout(() => {
                if (!styleArrived) fallback();
            }, LOAD_TIMEOUT_MS);

            markerClass.current = maplibre.Marker;
            const els = { origin: document.createElement("div"), pin: document.createElement("div"), puck: document.createElement("div") };
            Object.values(els).forEach((el) => (el.style.pointerEvents = "none"));
            fixedMarkers.current = {
                origin: new maplibre.Marker({ element: els.origin, anchor: "bottom" }),
                pin: new maplibre.Marker({ element: els.pin, anchor: "bottom" }),
                puck: new maplibre.Marker({ element: els.puck, anchor: "center", rotationAlignment: "map" }),
            };
            setMarkerEls(els);

            map.on("style.load", () => {
                styleArrived = true;
                window.clearTimeout(timeout);
                if (cancelled) return;
                if (soft) applySoftPalette(map!);
                addRouteLayers(map!);
                setMode((m) => (m === "live" ? m : "live"));
                map!.fire("demo:style");
            });
        })().catch(fallback);

        const stopsMap = stopMarkers.current;
        return () => {
            cancelled = true;
            map?.remove();
            mapRef.current = null;
            fixedMarkers.current = null;
            stopsMap.clear();
        };
        // The map is created once; style and scene changes are applied by the effects below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nearView]);

    const appliedStyle = useRef(styleUrl ?? MAP_STYLES[0].url);
    useEffect(() => {
        const map = mapRef.current;
        if (mode !== "live" || !map || !styleUrl || styleUrl === appliedStyle.current) return;
        appliedStyle.current = styleUrl;
        map.setStyle(proxiedTileUrl(styleUrl));
    }, [styleUrl, mode]);

    useEffect(() => {
        const map = mapRef.current;
        if (mode !== "live" || !map) return;
        const apply = () => {
            (map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined)?.setData(featureCollection(allRoutes));
            paintProgress(map, tone, progress.get());
        };
        apply();
        map.on("demo:style", apply);
        return () => {
            map.off("demo:style", apply);
        };
    }, [allRoutes, mode, tone, progress]);

    useEffect(() => {
        const map = mapRef.current;
        const markers = fixedMarkers.current;
        const MarkerClass = markerClass.current;
        if (mode !== "live" || !map || !markers || !MarkerClass) return;

        const start = route?.[0] ?? origin?.lngLat;
        if (start) markers.origin.setLngLat(start).addTo(map);
        else markers.origin.remove();
        if (target) markers.pin.setLngLat(target.lngLat).addTo(map);
        else markers.pin.remove();
        if (!route?.length) markers.puck.remove();

        const wanted = new Map((stops ?? []).map((s) => [s.id, s]));
        stopMarkers.current.forEach((entry, id) => {
            if (!wanted.has(id)) {
                entry.marker.remove();
                stopMarkers.current.delete(id);
            }
        });
        wanted.forEach((stop, id) => {
            if (stopMarkers.current.has(id)) return;
            const el = document.createElement("div");
            el.style.pointerEvents = "none";
            const marker = new MarkerClass({ element: el, anchor: stop.title ? "bottom" : "center" }).setLngLat(stop.lngLat).addTo(map);
            stopMarkers.current.set(id, { marker, el });
        });
        setStopEls((stops ?? []).map((s, index) => ({ id: s.id, el: stopMarkers.current.get(s.id)!.el, index })));

        const points = [
            ...allRoutes.flat(),
            ...[origin, target, ...(stops ?? [])].filter((p): p is Place => !!p).map((p) => p.lngLat),
        ];
        const duration = reduceMotion ? 0 : 1000;
        // A new destination is a new question, so it's framed even if the visitor panned before.
        if (target?.id !== framedTarget.current) userMoved.current = false;
        framedTarget.current = target?.id;
        if (userMoved.current) return;
        if (points.length > 1) {
            const b = boundsOf(points, 0);
            const { clientWidth, clientHeight } = map.getContainer();
            const padding = Math.round(
                Math.min(FIT_PADDING_MAX, Math.max(FIT_PADDING_MIN, Math.min(clientWidth, clientHeight) * FIT_PADDING_RATIO)),
            );
            const labelled = stops?.some((stop) => stop.title);
            const pinned = !!(origin || target);
            const room = labelled
                ? { top: TITLE_ROOM.top, side: TITLE_ROOM.side }
                : { top: pinned ? PIN_ROOM_TOP : 0, side: 0 };
            map.fitBounds([[b.west, b.south], [b.east, b.north]], {
                padding: {
                    top: padding + room.top + (overlayInset?.top ?? 0),
                    bottom: padding + (overlayInset?.bottom ?? 0),
                    left: padding + room.side + (overlayInset?.left ?? 0),
                    right: padding + room.side + (overlayInset?.right ?? 0),
                },
                duration,
                maxZoom: MAX_FIT_ZOOM,
            });
        } else if (points.length === 1) {
            map.flyTo({ center: points[0], zoom: FOCUS_ZOOM, duration: reduceMotion ? 0 : FLY_MS, essential: true });
        }
    }, [origin, target, route, stops, allRoutes, mode, reduceMotion, overlayInset]);

    // Reveal the routes; the puck is placed on MapLibre's own render, so it moves in the very frame the
    // revealed line is drawn and never runs ahead of it. It disappears on arrival.
    useMotionValueEvent(progress, "change", (t) => {
        const map = mapRef.current;
        if (mode !== "live" || !map) return;
        paintProgress(map, tone, t);
        map.triggerRepaint();
    });

    useEffect(() => {
        const map = mapRef.current;
        if (mode !== "live" || !map) return;
        const placePuck = () => {
            const puck = fixedMarkers.current?.puck;
            if (!puck) return;
            const t = progress.get();
            if (!route?.length || t <= 0 || t >= 1) {
                puck.remove();
                return;
            }
            const { head, heading } = sliceRoute(route, t);
            puck.setLngLat(head).setRotation(heading).addTo(map);
        };
        map.on("render", placePuck);
        placePuck();
        return () => {
            map.off("render", placePuck);
        };
    }, [mode, route, progress]);

    useEffect(() => {
        const map = mapRef.current;
        if (mode !== "live" || !map || !drift || reduceMotion) return;
        const stop = () => cancelAnimationFrame(frame);
        let frame = 0;
        let last = performance.now();
        const tick = (now: number) => {
            map.setBearing(map.getBearing() + ((now - last) / 1000) * DRIFT_DEG_PER_SEC);
            last = now;
            frame = requestAnimationFrame(tick);
        };
        map.easeTo({ pitch: DRIFT_PITCH, duration: 0 });
        frame = requestAnimationFrame(tick);
        map.on("dragstart", stop);
        map.on("zoomstart", stop);
        return () => {
            stop();
            map.off("dragstart", stop);
            map.off("zoomstart", stop);
        };
    }, [mode, drift, reduceMotion, styleUrl]);

    return (
        <div ref={rootRef} data-ui className={cn("relative isolate overflow-hidden bg-raised", className)}>
            {/* MapLibre makes its container position: relative, so it sits inside a positioned wrapper. */}
            <div className={cn("absolute inset-0", mode === "fallback" && "hidden")}>
                <div ref={containerRef} className="size-full" />
            </div>
            {mode === "fallback" && <DrawnMap scene={scene} allRoutes={allRoutes} progress={progress} showLabels={showLabels} tone={tone} />}
            {mode === "loading" && <div aria-hidden className="absolute inset-0 animate-pulse bg-raised" />}
            {markerEls && (
                <>
                    {createPortal(scene.originIcon ? <IconPin icon={scene.originIcon} /> : <OriginGlyph />, markerEls.origin)}
                    {createPortal(<DroppingPin key={target?.id} />, markerEls.pin)}
                    {createPortal(<PuckGlyph />, markerEls.puck)}
                </>
            )}
            {stopEls.map(({ id, el, index }) => {
                const stop = stops?.find((s) => s.id === id);
                const delay = index * STAGGER;
                if (stop?.title) return createPortal(<TitledPin key={id} delay={delay} title={stop.title} />, el, id);
                // Keyed by label too, so a renumbered stop pops in again and the change is noticed.
                return createPortal(<StopDot key={`${id}-${stop?.label ?? ""}`} delay={delay} label={stop?.label} tone={tone} />, el, id);
            })}
        </div>
    );
}

function DroppingPin() {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div initial={reduceMotion ? false : { y: -28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.drop}>
            <PinGlyph />
        </motion.div>
    );
}

function TitledPin({ delay = 0, title }: { delay?: number; title: string }) {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            className="relative"
            initial={reduceMotion ? false : { y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ...SPRING.drop, delay }}
        >
            <PinGlyph className="h-[34px] w-[26px]" />
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-2.5 py-1 text-[12px] font-medium leading-[1.4] text-foreground [filter:drop-shadow(0_1px_1px_hsl(var(--foreground)/0.16))_drop-shadow(0_3px_8px_hsl(var(--foreground)/0.12))]">
                {title}
                <span aria-hidden className="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-[5px] rotate-45 bg-card" />
            </span>
        </motion.div>
    );
}

function StopDot({ delay = 0, label, tone }: { delay?: number; label?: string; tone: RouteTone }) {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div initial={reduceMotion ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...SPRING.drop, delay }}>
            {label ? <NumberedStop label={label} tone={tone} /> : <StopGlyph />}
        </motion.div>
    );
}

const VIEW_W = 1000;
const VIEW_H = 720;
const TONE_STROKE: Record<RouteTone, string> = { primary: "stroke-primary", muted: "stroke-soft" };

function DrawnMap({
    scene,
    allRoutes,
    progress,
    showLabels,
    tone,
}: {
    scene: MapScene;
    allRoutes: LngLat[][];
    progress: MotionValue<number>;
    showLabels: boolean;
    tone: RouteTone;
}) {
    const { origin, target, route, stops } = scene;
    const project = useMemo(() => projector(boundsOf(PLACES.map((p) => p.lngLat), 0.18), VIEW_W, VIEW_H), []);
    const toPath = (coords: LngLat[]) => coords.map((c, i) => `${i ? "L" : "M"}${project(c).join(" ")}`).join("");
    const streets = useMemo(() => FALLBACK_STREETS.map(toPath), [project]); // eslint-disable-line react-hooks/exhaustive-deps
    const roads = useMemo(() => ALL_DEMO_ROUTES.map((r) => toPath(r.coords)), [project]); // eslint-disable-line react-hooks/exhaustive-deps

    const head = (t: number) => (route?.length ? sliceRoute(route, t) : null);
    const headX = useTransform(progress, (t) => (head(t) ? project(head(t)!.head)[0] : 0));
    const headY = useTransform(progress, (t) => (head(t) ? project(head(t)!.head)[1] : 0));
    const headRotate = useTransform(progress, (t) => head(t)?.heading ?? 0);
    const puckOpacity = useTransform(progress, (t) => (t > 0 && t < 1 ? 1 : 0));
    const pathLength = useTransform(progress, (t) => Math.max(0.001, t));

    const pins = [target, ...(stops ?? [])].filter((p): p is MapStop => !!p);
    const startLngLat = route?.[0] ?? origin?.lngLat;
    const start = startLngLat ? project(startLngLat) : null;

    return (
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of central Addis Ababa" className="absolute inset-0 size-full">
            <rect width={VIEW_W} height={VIEW_H} className="fill-raised" />
            {[...streets.map((d) => ({ d, w: 9 })), ...roads.map((d) => ({ d, w: 12 }))].map(({ d, w }, i) => (
                <g key={i}>
                    <path d={d} fill="none" strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" className="stroke-line-strong" />
                    <path d={d} fill="none" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className="stroke-card" />
                </g>
            ))}
            {showLabels &&
                PLACES.map((place) => {
                    const [x, y] = project(place.lngLat);
                    return (
                        <g key={place.id}>
                            <circle cx={x} cy={y} r={5} className="fill-subtle" />
                            <text x={x + 12} y={y + 6} className="fill-soft text-[20px]">
                                {place.name}
                            </text>
                        </g>
                    );
                })}
            {allRoutes.map((coords, i) => (
                <g key={i}>
                    <motion.path d={toPath(coords)} fill="none" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" className="stroke-card" style={{ pathLength }} />
                    <motion.path d={toPath(coords)} fill="none" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" className={TONE_STROKE[tone]} style={{ pathLength }} />
                </g>
            ))}
            {route?.length ? (
                <motion.g style={{ x: headX, y: headY, opacity: puckOpacity }}>
                    <motion.g style={{ rotate: headRotate }}>
                        <PuckGlyph x={-27} y={-27} width={54} height={54} style={{ width: 54, height: 54 }} />
                    </motion.g>
                </motion.g>
            ) : null}
            {start && <OriginGlyph x={start[0] - 19} y={start[1] - 50} width={38} height={50} style={{ width: 38, height: 50 }} />}
            <AnimatePresence>
                {pins.map((pin, i) => {
                    const [x, y] = project(pin.lngLat);
                    return (
                        <motion.g
                            key={pin.id}
                            initial={{ opacity: 0, y: -40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ ...SPRING.drop, delay: i * STAGGER }}
                        >
                            {pin.id === target?.id || pin.title ? (
                                <>
                                    <PinGlyph x={x - 24} y={y - 63} width={48} height={63} style={{ width: 48, height: 63 }} />
                                    {pin.title && (
                                        <text x={x} y={y - 72} textAnchor="middle" className="fill-foreground text-[22px] font-medium">
                                            {pin.title}
                                        </text>
                                    )}
                                </>
                            ) : (
                                <g>
                                    <StopGlyph x={x - 14} y={y - 14} width={28} height={28} style={{ width: 28, height: 28 }} />
                                    {pin.label && (
                                        <text x={x} y={y + 5} textAnchor="middle" className="fill-primary-foreground text-[14px] font-semibold">
                                            {pin.label}
                                        </text>
                                    )}
                                </g>
                            )}
                        </motion.g>
                    );
                })}
            </AnimatePresence>
        </svg>
    );
}
