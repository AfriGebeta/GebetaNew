"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useTransform,
} from "motion/react";
import { ArrowUp, Check, Copy, CornerUpLeft, CornerUpRight, Flag, MapPin, RotateCw, Search, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TIMING, DURATION, EASE, IN_VIEW, STAGGER } from "@/lib/motion";
import {
    DIRECTIONS_TILE_TARGET,
    MAP_STYLES,
    MATRIX,
    ONM_DESTINATIONS,
    OPTIMIZATION_COPY,
    OPTIMIZATION_STOPS,
    ORIGIN_ID,
    PLACES,
    ROUTE_CYCLE,
    SDK_SNIPPETS,
    type Place,
} from "@/constants/landing";
import {
    DEMO_ONM,
    DEMO_OPTIMIZATION,
    demoKm,
    demoMinutes,
    demoRoute,
    maneuverKind,
    type Maneuver,
    type ManeuverKind,
} from "@/constants/demo-routes";
import SegmentedControl from "@/components/ui/segmented-control";
import LiveMap from "./map/live-map";
import { geocode } from "./map/demo-api";
import { formatDistance, formatDuration } from "./map/geo";
import { sleep, useLoop } from "./use-loop";

const place = (id: string) => PLACES.find((p) => p.id === id)!;
const ORIGIN = place(ORIGIN_ID);

export function TilesDemo({ zoom = 14, className }: { zoom?: number; className?: string }) {
    const [style, setStyle] = useState<string>(MAP_STYLES[0].id);
    const progress = useMotionValue(0);
    const scene = useMemo(() => ({}), []);
    const url = MAP_STYLES.find((s) => s.id === style)!.url;

    return (
        <div className={cn("absolute inset-0", className)}>
            <LiveMap className="absolute inset-0" scene={scene} progress={progress} styleUrl={url} zoom={zoom} drift soft={false} />
            <SegmentedControl
                aria-label="Map style"
                value={style}
                onValueChange={setStyle}
                options={MAP_STYLES.map((s) => ({ value: s.id, label: s.label }))}
                className="absolute left-3 top-3 shadow-overlay"
            />
        </div>
    );
}

export function GeocodingDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const indexRef = useRef(0);
    const [typed, setTyped] = useState(PLACES[0].query);
    const [hits, setHits] = useState<Place[]>([]);
    const [done, setDone] = useState(false);

    const { reduceMotion } = useLoop(ref, async (signal) => {
        const next = PLACES[indexRef.current % PLACES.length];
        indexRef.current += 1;
        setDone(false);
        for (let c = 0; c <= next.query.length; c++) {
            setTyped(next.query.slice(0, c));
            await sleep(DEMO_TIMING.typeCharMs, signal);
        }
        const found = await geocode(next.query);
        setHits(found.hits.slice(0, 3));
        setDone(true);
        await sleep(DEMO_TIMING.restMs, signal);
    });

    useEffect(() => {
        if (!reduceMotion) return;
        void geocode(PLACES[0].query).then((found) => {
            setHits(found.hits.slice(0, 3));
            setDone(true);
        });
    }, [reduceMotion]);

    return (
        <div ref={ref} data-ui className={cn("absolute inset-x-5 top-5 flex flex-col gap-2", className)}>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-card px-3 text-[14px] text-foreground">
                <Search aria-hidden className="size-4 shrink-0 text-subtle" />
                <span className="truncate">{typed}</span>
                <motion.span
                    aria-hidden
                    className="-ml-1.5 h-4 w-px shrink-0 bg-foreground"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <ul className="flex flex-col overflow-hidden rounded-lg bg-card p-1 shadow-card" aria-label="Results">
                <AnimatePresence mode="popLayout">
                    {done &&
                        hits.map((hit, i) => (
                            <motion.li
                                key={`${typed}-${hit.id}`}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * STAGGER, duration: DURATION.base, ease: EASE.out }}
                                className={cn("flex items-center gap-2.5 rounded-md px-2 py-2", i === 0 && "bg-hover")}
                            >
                                <MapPin aria-hidden className="size-3.5 shrink-0 text-subtle" />
                                <span className="truncate text-[13px] font-medium text-foreground">{hit.name}</span>
                                <span className="ml-auto shrink-0 text-[13px] tabular-nums text-soft">
                                    {hit.lngLat[1].toFixed(4)}, {hit.lngLat[0].toFixed(4)}
                                </span>
                            </motion.li>
                        ))}
                </AnimatePresence>
                {!done && <li className="px-2 py-2 text-[13px] text-soft">Searching…</li>}
            </ul>
        </div>
    );
}

const MANEUVER_ICON: Record<ManeuverKind, typeof ArrowUp> = {
    straight: ArrowUp,
    right: CornerUpRight,
    left: CornerUpLeft,
    uturn: Undo2,
    roundabout: RotateCw,
    arrive: Flag,
};

const stepAt = (maneuvers: Maneuver[], t: number) => {
    let index = 0;
    maneuvers.forEach((m, i) => {
        if (m.at <= t) index = i;
    });
    return index;
};

function useDrive(ref: React.RefObject<Element>, durationMs: number, onLap?: () => void, restMs: number = DEMO_TIMING.restMs) {
    const progress = useMotionValue(0);
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);
    const { reduceMotion } = useLoop(ref, async (signal) => {
        onLap?.();
        progress.set(0);
        await sleep(DURATION.slow * 1000, signal);
        await animate(progress, 1, { duration: durationMs / 1000, ease: "linear" });
        await sleep(restMs, signal);
    }, [], ready);
    useEffect(() => {
        if (reduceMotion) progress.set(1);
    }, [reduceMotion, progress]);
    return { progress, onReady };
}

const DIRECTIONS_TARGET = place(DIRECTIONS_TILE_TARGET);
const DIRECTIONS_ROUTE = demoRoute(ORIGIN_ID, DIRECTIONS_TILE_TARGET)!;

const INSTRUCTION_INSET = { bottom: 52 };

export function DirectionsDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);
    const { progress, onReady } = useDrive(ref, DEMO_TIMING.driveMs);
    const scene = useMemo(() => ({ origin: ORIGIN, target: DIRECTIONS_TARGET, route: DIRECTIONS_ROUTE.coords }), []);
    useMotionValueEvent(progress, "change", (t) => setStep(stepAt(DIRECTIONS_ROUTE.maneuvers, t)));

    const current = DIRECTIONS_ROUTE.maneuvers[step];
    const Icon = MANEUVER_ICON[maneuverKind(current.type)];

    return (
        <div ref={ref} className={cn("absolute inset-0", className)}>
            <LiveMap
                className="absolute inset-0"
                scene={scene}
                progress={progress}
                onReady={onReady}
                showLabels={false}
                controls={false}
                overlayInset={INSTRUCTION_INSET}
            />
            <div data-ui className="absolute inset-x-3 bottom-3 overflow-hidden rounded-lg bg-ink text-ink-foreground shadow-overlay">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={step}
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -24, opacity: 0 }}
                        transition={{ duration: DURATION.base, ease: EASE.out }}
                        className="flex items-center gap-3 px-3 py-2.5"
                    >
                        <Icon aria-hidden className="size-5 shrink-0 text-primary" />
                        <span className="truncate text-[14px] font-medium">{current.text}</span>
                        {current.distanceM > 0 && (
                            <span className="ml-auto shrink-0 text-[13px] tabular-nums opacity-70">{formatDistance(current.distanceM)}</span>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

const CYCLE = ROUTE_CYCLE.map((id) => ({ place: place(id), route: demoRoute(ORIGIN_ID, id)! }));

export function RouteDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(0);
    const lap = useRef(-1);
    const { progress, onReady } = useDrive(ref, DEMO_TIMING.driveMs, () => {
        lap.current += 1;
        setIndex(lap.current % CYCLE.length);
    });
    const { place: target, route: trip } = CYCLE[index];
    const scene = useMemo(() => ({ origin: ORIGIN, target, route: trip.coords }), [target, trip]);

    return (
        <div ref={ref} className={cn("absolute inset-0 flex flex-col", className)}>
            <LiveMap className="flex-1" scene={scene} progress={progress} onReady={onReady} />
            <div className="flex min-h-14 items-center justify-between gap-3 bg-card px-4 py-3" aria-live="polite">
                <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-[14px] font-medium leading-none text-foreground">
                        {ORIGIN.name} to {target.name}
                    </span>
                    <span className="text-[13px] leading-none tabular-nums text-soft">
                        {formatDistance(trip.distanceM)} · {formatDuration(trip.durationS)} by car · {trip.maneuvers.length} steps
                    </span>
                </span>
            </div>
        </div>
    );
}

function CountUp({ value, start, delay, decimals = 0 }: { value: number; start: boolean; delay: number; decimals?: number }) {
    const mv = useMotionValue(0);
    const shown = useTransform(mv, (v) => v.toFixed(decimals));
    useEffect(() => {
        if (!start) return;
        const controls = animate(mv, value, { duration: DURATION.slow, delay, ease: EASE.out });
        return () => controls.stop();
    }, [start, value, delay, mv]);
    return <motion.span>{shown}</motion.span>;
}

type MatrixMetric = (typeof MATRIX.metrics)[number]["value"];

const matrixCell = (metric: MatrixMetric, from: string, to: string) =>
    metric === "time" ? { value: demoMinutes(from, to), unit: "min", decimals: 0 } : { value: demoKm(from, to), unit: "km", decimals: 1 };

export function MatrixDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, IN_VIEW);
    const [metric, setMetric] = useState<MatrixMetric>("time");
    const [active, setActive] = useState<[number, number]>(MATRIX.initial);
    const cols = MATRIX.destinations.length;
    const [ar, ac] = active;
    const from = MATRIX.origins[ar];
    const to = MATRIX.destinations[ac];

    return (
        <div ref={ref} data-ui className={cn("relative flex flex-col justify-center gap-3 p-4 sm:absolute sm:inset-0", className)}>
            <div className="flex items-center justify-between gap-3">
                <SegmentedControl
                    aria-label="Show travel time or distance"
                    value={metric}
                    onValueChange={(v) => setMetric(v as MatrixMetric)}
                    options={MATRIX.metrics}
                />
                <span className="text-[12px] text-subtle">{MATRIX.hint}</span>
            </div>

            <table className="w-full border-separate border-spacing-1 text-[13px]">
                <caption className="sr-only">
                    Driving {metric === "time" ? "minutes" : "kilometres"} from each origin (rows) to each destination (columns)
                </caption>
                <thead>
                    <tr>
                        <th scope="col" className="p-1 text-left text-[12px] font-normal text-subtle">
                            {MATRIX.from} ↓ <span className="px-0.5">/</span> {MATRIX.to} →
                        </th>
                        {MATRIX.destinations.map((d, c) => (
                            <th key={d} scope="col" className={cn("p-1 text-right font-medium text-soft transition-colors", ac === c && "text-foreground")}>
                                {MATRIX.labels[d]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {MATRIX.origins.map((o, r) => (
                        <tr key={o}>
                            <th scope="row" className={cn("whitespace-nowrap p-1 text-left font-medium text-soft transition-colors", ar === r && "text-foreground")}>
                                {MATRIX.labels[o]}
                            </th>
                            {MATRIX.destinations.map((d, c) => {
                                const delay = (r * cols + c) * STAGGER;
                                const selected = ar === r && ac === c;
                                const cell = matrixCell(metric, o, d);
                                return (
                                    <motion.td
                                        key={d}
                                        onMouseEnter={() => setActive([r, c])}
                                        onClick={() => setActive([r, c])}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={inView ? { opacity: 1, scale: 1 } : undefined}
                                        transition={{ delay, duration: DURATION.base, ease: EASE.out }}
                                        className={cn(
                                            "cursor-pointer rounded-md bg-card px-2 py-2 text-right tabular-nums text-foreground transition-colors duration-150",
                                            (ar === r || ac === c) && "bg-ink/[0.07]",
                                            selected && "bg-primary text-primary-foreground",
                                        )}
                                    >
                                        <CountUp key={metric} value={cell.value} decimals={cell.decimals} start={inView} delay={delay} />
                                        <span className={cn("ml-0.5 text-[11px]", selected ? "opacity-70" : "text-subtle")}>{cell.unit}</span>
                                    </motion.td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex flex-col gap-1 px-1" aria-live="polite">
                <p className="text-[13px] text-foreground">
                    {MATRIX.labels[from]} → {MATRIX.labels[to]}:{" "}
                    <span className="tabular-nums">
                        {demoMinutes(from, to)} min · {demoKm(from, to).toFixed(1)} km
                    </span>
                </p>
                <p className="text-[12px] text-soft">{MATRIX.summary(MATRIX.origins.length, cols)}</p>
            </div>
        </div>
    );
}

const DEPOT = place(ORIGIN_ID);
const STOPS = OPTIMIZATION_STOPS.map(place);
const TOURS = {
    entered: { line: DEMO_OPTIMIZATION.enteredLine, minutes: DEMO_OPTIMIZATION.enteredMinutes },
    best: { line: DEMO_OPTIMIZATION.bestLine, minutes: DEMO_OPTIMIZATION.bestMinutes },
};

const STOP_PINS = STOPS.map((stop) => ({ ...stop, pin: true }));
const SAVED_MINUTES = TOURS.entered.minutes - TOURS.best.minutes;
const STRIP_INSET = { top: 36 };

export function OptimizationDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [optimized, setOptimized] = useState(false);
    const lap = useRef(0);
    const { progress, onReady } = useDrive(ref, DEMO_TIMING.tourDriveMs, () => {
        setOptimized(lap.current % 2 === 1);
        lap.current += 1;
    }, DEMO_TIMING.tourRestMs);
    const tour = optimized ? TOURS.best : TOURS.entered;
    const scene = useMemo(() => ({ origin: DEPOT, depot: true, route: tour.line, stops: STOP_PINS }), [tour]);
    const rows = [
        { key: "entered", label: OPTIMIZATION_COPY.entered, minutes: TOURS.entered.minutes, active: !optimized, bar: "bg-soft" },
        { key: "best", label: OPTIMIZATION_COPY.best, minutes: TOURS.best.minutes, active: optimized, bar: "bg-primary" },
    ];

    return (
        <div ref={ref} className={cn("absolute inset-0", className)}>
            <LiveMap
                className="absolute inset-0"
                scene={scene}
                progress={progress}
                onReady={onReady}
                showLabels={false}
                tone={optimized ? "primary" : "muted"}
                controls={false}
                puck={false}
                overlayInset={STRIP_INSET}
            />
            <div data-ui className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-card p-1 text-[12px] shadow-overlay">
                {rows.map((row) => (
                    <span
                        key={row.key}
                        className={cn(
                            "flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 transition-colors duration-300",
                            row.active ? "bg-raised text-foreground" : "text-soft",
                        )}
                    >
                        <span aria-hidden className={cn("size-2 rounded-full", row.bar)} />
                        {row.label}
                        <span className="font-medium tabular-nums">{row.minutes} min</span>
                    </span>
                ))}
                <AnimatePresence initial={false}>
                    {optimized && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: DURATION.base, ease: EASE.out }}
                            className="overflow-hidden whitespace-nowrap pr-2 font-medium tabular-nums text-success"
                        >
                            {OPTIMIZATION_COPY.saved(SAVED_MINUTES)}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const ONM = ONM_DESTINATIONS.map((id) => ({ place: place(id), route: demoRoute(ORIGIN_ID, id)! }));
const ONM_SCENE = {
    origin: ORIGIN,
    routes: ONM.map((d) => d.route.coords),
    stops: ONM.map((d) => ({ ...d.place, title: `${d.place.short ?? d.place.name} · ${DEMO_ONM[d.place.id].minutes} min` })),
};
const ONM_RANKED = [...ONM].sort((a, b) => DEMO_ONM[a.place.id].minutes - DEMO_ONM[b.place.id].minutes);

export function OneToManyDemo({ className }: { className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { progress, onReady } = useDrive(ref, DEMO_TIMING.fanDriveMs);

    return (
        <div ref={ref} className={cn("absolute inset-0 flex flex-col", className)}>
            <LiveMap className="min-h-[260px] flex-1" scene={ONM_SCENE} progress={progress} showLabels={false} onReady={onReady} />
            <ol className="flex gap-1 overflow-x-auto bg-card p-2" aria-label="Destinations, fastest first">
                {ONM_RANKED.map((d, i) => (
                    <li
                        key={d.place.id}
                        className={cn(
                            "flex shrink-0 items-baseline gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px]",
                            i === 0 ? "bg-primary/15 text-foreground" : "text-soft",
                        )}
                    >
                        <span className="font-medium text-foreground">{d.place.short ?? d.place.name}</span>
                        <span className="tabular-nums">{DEMO_ONM[d.place.id].minutes} min</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function SdkDemo({ className }: { className?: string }) {
    const [tab, setTab] = useState<string>(SDK_SNIPPETS[0].id);
    const [copied, setCopied] = useState(false);
    const snippet = SDK_SNIPPETS.find((s) => s.id === tab)!;

    return (
        <div data-ui className={cn("absolute inset-0 flex flex-col gap-3 p-4", className)}>
            <div className="flex items-center justify-between gap-2">
                <SegmentedControl
                    aria-label="Code sample"
                    value={tab}
                    onValueChange={setTab}
                    options={SDK_SNIPPETS.map((s) => ({ value: s.id, label: s.label }))}
                />
                <CopyButton text={snippet.code} copied={copied} onCopied={setCopied} />
            </div>
            <CodeBlock code={snippet.code} keyId={tab} className="flex-1" />
        </div>
    );
}

export function CopyButton({ text, copied, onCopied }: { text: string; copied: boolean; onCopied: (v: boolean) => void }) {
    return (
        <button
            type="button"
            aria-label="Copy code"
            onClick={() => {
                void navigator.clipboard?.writeText(text);
                onCopied(true);
                window.setTimeout(() => onCopied(false), DEMO_TIMING.restMs);
            }}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-subtle outline-none transition-colors hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
        >
            {copied ? <Check aria-hidden className="size-4 text-success" /> : <Copy aria-hidden className="size-4" />}
        </button>
    );
}

export function CodeBlock({ code, keyId, className }: { code: string; keyId?: string; className?: string }) {
    return (
        <div className={cn("relative overflow-hidden rounded-lg bg-foreground", className)}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.pre
                    key={keyId ?? code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: DURATION.base, ease: EASE.out }}
                    className="h-full overflow-x-auto p-4 font-mono text-[13px] leading-[1.6] text-background"
                >
                    <code>{code}</code>
                </motion.pre>
            </AnimatePresence>
        </div>
    );
}

