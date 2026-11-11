"use client";

import { generateMapEmbed, type Marker } from "@/app/actions/map-embed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Field from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Page, PageIntro } from "@/components/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { uploadMarkerImage } from "@/lib/upload";
import {
    BoxSelect,
    Check,
    Copy,
    EyeIcon, EyeOffIcon,
    ImagePlus,
    Loader2,
    Map as MapIcon,
    MousePointer, RotateCcw,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createExternalPlace, createManyExternalPlaces, getAllExternalPlaces } from "@/lib/external";
import { AuthContext } from "@/providers/AuthProvider";
import { tokenColor } from "@/lib/tokens";

export default function MapEmbedPage() {
    const { toast } = useToast();
    const { currentUser } = useContext(AuthContext);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const mapReadyRef = useRef(false);
    const gebetaMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const centerMarkerRef = useRef<any>(null);
    const markersStateRef = useRef<Marker[]>([]);

    const [serverToken, setServerToken] = useState("");
    const [clientToken, setClientToken] = useState("");
    const [showServerToken, setShowServerToken] = useState(false);
    const [showClientToken, setShowClientToken] = useState(false);

    const [mapLoading, setMapLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const [center, setCenter] = useState({ lat: 9.0161, lng: 38.7685 });
    const zoomRef = useRef(13);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<"center" | "marker" | "bounds">("center");

    const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
    const [boundsCorner1, setBoundsCorner1] = useState<[number, number] | null>(null);

    const [iframeSrc, setIframeSrc] = useState("");
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [pendingLabel, setPendingLabel] = useState("");
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [pendingUploading, setPendingUploading] = useState(false);

    const [manualName, setManualName] = useState("");
    const [manualLat, setManualLat] = useState("");
    const [manualLng, setManualLng] = useState("");
    const [manualType, setManualType] = useState("");
    const [manualImage, setManualImage] = useState<string | null>(null);
    const [manualUploading, setManualUploading] = useState(false);
    const [manualSubmitting, setManualSubmitting] = useState(false);

    const [csvUploading, setCsvUploading] = useState(false);
    const [visibleMarkerCount, setVisibleMarkerCount] = useState(5);

    const modeRef = useRef(mode);
    const boundsCorner1Ref = useRef(boundsCorner1);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { boundsCorner1Ref.current = boundsCorner1; }, [boundsCorner1]);

    useEffect(() => {
        if ((window as any).GebetaMaps) return;
        const script = document.createElement("script");
        script.src = "https://tiles.gebeta.app/static/v3/gebeta-maps.umd.js";
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!currentUser?.user?.username) return;
        getAllExternalPlaces(currentUser.user.username)
            .then(places => {
                //@ts-ignore
                const mapped: Marker[] = places
                    ?.filter(p => p.active !== false)
                    .map(p => ({ lat: p.lat, lng: p.lng, label: p.name, image: p.image }));
                setMarkers(mapped);
                if (mapReadyRef.current) syncMarkersOnMap(mapped);
            })
            .catch(err => toast({ description: "Failed to load places: " + err.message, variant: "destructive" }));
    }, [currentUser?.user?.username]);

    useEffect(() => { markersStateRef.current = markers; }, [markers]);

    const DEFAULT_ICON = "default-pin";
    const seenImagesRef = useRef<Set<string>>(new Set());

    const syncMarkersOnMap = useCallback((newMarkers: Marker[]) => {
        const map = mapRef.current;
        if (!map) return;
        const maplibregl = (window as any).maplibregl;

        const buildFeatures = () => ({
            type: "FeatureCollection" as const,
            features: newMarkers.map((m) => {
                const url = m.image || "https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png";
                const iconId = m.image ? url : DEFAULT_ICON;
                return {
                    type: "Feature" as const,
                    geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
                    properties: { label: m.label || "", iconId },
                };
            }),
        });

        const applyLayer = () => {
            const data = buildFeatures();
            const source = map.getSource("dashboard-places");
            if (source) {
                source.setData(data);
            } else {
                map.addSource("dashboard-places", { type: "geojson", data });
                map.addLayer({
                    id: "dashboard-places-layer",
                    type: "symbol",
                    source: "dashboard-places",
                    layout: {
                        "icon-image": ["get", "iconId"],
                        "icon-size": 0.06,
                        "icon-anchor": "bottom",
                        "icon-allow-overlap": false,
                        "icon-ignore-placement": false,
                    },
                });

                const popup = new maplibregl.Popup({ offset: 25, closeButton: true });
                map.on("click", "dashboard-places-layer", (e: any) => {
                    const feature = e.features[0];
                    const label = feature.properties.label;
                    if (!label) return;
                    popup.setLngLat(feature.geometry.coordinates)
                        .setHTML('<div class="px-1 py-0.5 text-[13px] font-semibold">' + label + "</div>")
                        .addTo(map);
                });
                map.on("mouseenter", "dashboard-places-layer", () => { map.getCanvas().style.cursor = "pointer"; });
                map.on("mouseleave", "dashboard-places-layer", () => { map.getCanvas().style.cursor = ""; });
            }
        };

        const toLoad = newMarkers
            .map(m => m.image || "https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png")
            .filter(url => !seenImagesRef.current.has(url) && !map.hasImage(url) && url !== DEFAULT_ICON);

        const needsDefault = !map.hasImage(DEFAULT_ICON) && newMarkers.some(m => !m.image);
        const loadPromises: Promise<any>[] = [];

        if (needsDefault) {
            loadPromises.push(
                map.loadImage("https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png")
                    .then((res: any) => { if (!map.hasImage(DEFAULT_ICON)) map.addImage(DEFAULT_ICON, res.data); })
                    .catch(() => { })
            );
        }

        Array.from(new Set(toLoad)).forEach(url => {
            seenImagesRef.current.add(url);
            loadPromises.push(
                map.loadImage(url)
                    .then((res: any) => { if (!map.hasImage(url)) map.addImage(url, res.data); })
                    .catch(() => { })
            );
        });

        if (loadPromises.length === 0) {
            applyLayer();
        } else {
            Promise.all(loadPromises).then(applyLayer);
        }
    }, []);

    const handleMarkerImageUpload = useCallback(async (i: number, file: File) => {
        setUploadingIndex(i);
        try {
            const url = await uploadMarkerImage(file);
            setMarkers(prev => {
                const u = prev.map((m, idx) => idx === i ? { ...m, image: url } : m);
                syncMarkersOnMap(u);
                return u;
            });
            toast({ description: "Marker image uploaded!" });
        } catch (e: any) {
            toast({ description: e.message ?? "Upload failed", variant: "destructive" });
        } finally {
            setUploadingIndex(null);
        }
    }, [syncMarkersOnMap, toast]);

    const handlePendingImageUpload = useCallback(async (file: File) => {
        setPendingUploading(true);
        try {
            const url = await uploadMarkerImage(file);
            setPendingImage(url);
        } catch (e: any) {
            toast({ description: e.message ?? "Upload failed", variant: "destructive" });
        } finally {
            setPendingUploading(false);
        }
    }, [toast]);

    const cancelPendingMarker = useCallback(() => {
        setPendingMarker(null);
        setPendingLabel("");
        setPendingImage(null);
    }, []);

    const confirmPendingMarker = useCallback(() => {
        setPendingMarker(currentPending => {
            if (!currentPending) return currentPending;
            setPendingLabel(currentLabel => {
                setPendingImage(currentImage => {
                    const newMarker: Marker = {
                        lat: currentPending.lat,
                        lng: currentPending.lng,
                        label: currentLabel || undefined,
                        image: currentImage || undefined,
                    };
                    setMarkers(prev => {
                        const updated = [...prev, newMarker];
                        syncMarkersOnMap(updated);
                        return updated;
                    });
                    createExternalPlace({
                        name: currentLabel || "",
                        lat: currentPending.lat,
                        lng: currentPending.lng,
                        owner: currentUser?.user?.username,
                        image: currentImage || undefined,
                    }).catch(() => { });
                    return null;
                });
                return "";
            });
            return null;
        });
    }, [syncMarkersOnMap, currentUser?.user?.username]);

    const handleManualImageUpload = useCallback(async (file: File) => {
        setManualUploading(true);
        try {
            const url = await uploadMarkerImage(file);
            setManualImage(url);
        } catch (e: any) {
            toast({ description: e.message ?? "Upload failed", variant: "destructive" });
        } finally {
            setManualUploading(false);
        }
    }, [toast]);

    const handleManualAdd = useCallback(async () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || isNaN(lng)) {
            toast({ description: "Valid latitude and longitude required", variant: "destructive" });
            return;
        }
        setManualSubmitting(true);
        try {
            await createExternalPlace({
                name: manualName || "",
                lat, lng,
                owner: currentUser?.user?.username,
                type: manualType || undefined,
                image: manualImage || undefined,
            });
            const newMarker: Marker = { lat, lng, label: manualName || undefined, image: manualImage || undefined };
            setMarkers(prev => {
                const updated = [...prev, newMarker];
                syncMarkersOnMap(updated);
                return updated;
            });
            toast({ description: "Place added!" });
            setManualName(""); setManualLat(""); setManualLng(""); setManualType(""); setManualImage(null);
        } catch (e: any) {
            toast({ description: e.message ?? "Failed to add place", variant: "destructive" });
        } finally {
            setManualSubmitting(false);
        }
    }, [manualName, manualLat, manualLng, manualType, manualImage, currentUser?.user?.username, syncMarkersOnMap, toast]);

    const handleCsvUpload = useCallback(async (file: File) => {
        setCsvUploading(true);
        try {
            //@ts-ignore
            const Papa = (await import("papaparse")).default;
            const text = await file.text();
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            const rows = parsed.data as any[];
            const places = rows.map(r => ({
                name: r.name || r.location_name || "",
                lat: parseFloat(r.lat || r.latitude),
                lng: parseFloat(r.lng || r.longitude),
                type: r.type || r.location_type || undefined,
                owner: currentUser?.user?.username,
            })).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

            if (places.length === 0) {
                toast({ description: "No valid rows found in CSV", variant: "destructive" });
                return;
            }

            await createManyExternalPlaces(places);
            toast({ description: `Added ${places.length} places from CSV` });

            const mapped: Marker[] = places.map(p => ({ lat: p.lat, lng: p.lng, label: p.name }));
            setMarkers(prev => {
                const updated = [...prev, ...mapped];
                syncMarkersOnMap(updated);
                return updated;
            });
        } catch (e: any) {
            toast({ description: e.message ?? "CSV upload failed", variant: "destructive" });
        } finally {
            setCsvUploading(false);
        }
    }, [currentUser?.user?.username, syncMarkersOnMap, toast]);

    const handleLoadMap = async () => {
        if (!serverToken.trim() || !clientToken.trim()) {
            toast({ description: "Paste both tokens first", variant: "destructive" });
            return;
        }
        setMapLoading(true);
        try {
            const res = await fetch("/api/map-preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serverToken: serverToken.trim(), clientToken: clientToken.trim() }),
            });
            if (!res.ok) throw new Error();
            const { accessToken, refreshToken } = await res.json();

            await new Promise<void>((resolve) => {
                if ((window as any).GebetaMaps) { resolve(); return; }
                const iv = setInterval(() => {
                    if ((window as any).GebetaMaps) { clearInterval(iv); resolve(); }
                }, 100);
            });

            if (mapRef.current) {
                try { mapRef.current.remove(); } catch { }
                mapRef.current = null;
            }
            
            seenImagesRef.current.clear();
            markersRef.current = [];
            mapReadyRef.current = false;
            setMapReady(false);
            setMapLoaded(false);

            const gebeta = new (window as any).GebetaMaps({ auth: { accessToken, refreshToken } });
            gebetaMapRef.current = gebeta;
            const map = gebeta.init({
                container: mapContainerRef.current,
                center: [center.lng, center.lat],
                zoom: zoomRef.current,
                navigationControl: true,
            });
            mapRef.current = map;
            setMapReady(true);
            map.on("load", () => {
                mapReadyRef.current = true;
                addCenterMarker(center.lat, center.lng);
                syncMarkersOnMap(markersStateRef.current);
                toast({ description: "Map loaded! Click to configure." });
            });
            map.on("zoom", () => {
                zoomRef.current = Math.round(map.getZoom() * 10) / 10;
            });
        } catch {
            toast({ description: "Failed to load map. Check your tokens.", variant: "destructive" });
        } finally {
            setMapLoading(false);
        }
    };

    const addCenterMarker = (lat: number, lng: number) => {
        if (!mapRef.current) return;
        if (centerMarkerRef.current) centerMarkerRef.current.remove();
        const el = document.createElement("div");
        el.className = "size-5 cursor-move rounded-full border-[3px] border-white bg-[var(--ds-tag-blue-text)] shadow-overlay";
        const marker = new (window as any).maplibregl.Marker({ element: el, draggable: true })
            .setLngLat([lng, lat]).addTo(mapRef.current);
        marker.on("dragend", () => {
            const p = marker.getLngLat();
            setCenter({ lat: p.lat, lng: p.lng });
        });
        centerMarkerRef.current = marker;
    };

    const drawBoundsOnMap = (b: [number, number, number, number]) => {
        if (!mapRef.current) return;
        const geojson = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [[
                    [b[0], b[1]], [b[2], b[1]],
                    [b[2], b[3]], [b[0], b[3]],
                    [b[0], b[1]],
                ]],
            },
        };
        if (mapRef.current.getSource("bounds-preview")) {
            mapRef.current.getSource("bounds-preview").setData(geojson);
        } else {
            mapRef.current.addSource("bounds-preview", { type: "geojson", data: geojson });
            mapRef.current.addLayer({
                id: "bounds-fill", type: "fill", source: "bounds-preview",
                paint: { "fill-color": tokenColor("--primary"), "fill-opacity": 0.08 },
            });
            mapRef.current.addLayer({
                id: "bounds-line", type: "line", source: "bounds-preview",
                paint: { "line-color": tokenColor("--primary"), "line-width": 2, "line-dasharray": [4, 2] },
            });
        }
    };

    const clearBoundsFromMap = () => {
        if (!mapRef.current) return;
        ["bounds-fill", "bounds-line"].forEach(l => {
            try { if (mapRef.current.getLayer(l)) mapRef.current.removeLayer(l); } catch { }
        });
        try { if (mapRef.current.getSource("bounds-preview")) mapRef.current.removeSource("bounds-preview"); } catch { }
    };

    const handleClearBounds = () => {
        setBounds(null);
        setBoundsCorner1(null);
        clearBoundsFromMap();
        setMode("center");
    };

    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;

        const handleClick = (e: any) => {
            const { lng, lat } = e.lngLat;
            const currentMode = modeRef.current;

            if (currentMode === "bounds") {
                const corner1 = boundsCorner1Ref.current;
                if (!corner1) {
                    setBoundsCorner1([lng, lat]);
                    toast({ description: "First corner set — click the opposite corner." });
                } else {
                    const west = Math.min(corner1[0], lng);
                    const east = Math.max(corner1[0], lng);
                    const south = Math.min(corner1[1], lat);
                    const north = Math.max(corner1[1], lat);
                    const newBounds: [number, number, number, number] = [west, south, east, north];
                    setBounds(newBounds);
                    setBoundsCorner1(null);
                    clearBoundsFromMap();
                    drawBoundsOnMap(newBounds);
                    setMode("center");
                    toast({ description: "Bounding box set! Users can't pan or zoom outside this area." });
                }
                return;
            }

            if (currentMode === "center") {
                setCenter({ lat, lng });
                addCenterMarker(lat, lng);
                map.flyTo({ center: [lng, lat] });
            } else if (currentMode === "marker") {
                setPendingMarker({ lat, lng });
                setPendingLabel("");
                setPendingImage(null);
            }
        };

        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [mapReady]);

    useEffect(() => {
        if (!mapRef.current) return;
        const canvas = mapRef.current.getCanvas();
        if (mode === "bounds") canvas.style.cursor = "crosshair";
        else if (mode === "marker") canvas.style.cursor = "cell";
        else canvas.style.cursor = "";
    }, [mode, mapReady]);

    const removeMarker = (i: number) => {
        setMarkers(prev => {
            const u = prev.filter((_, idx) => idx !== i);
            syncMarkersOnMap(u);
            return u;
        });
    };

    const updateMarkerLabel = (i: number, label: string) => {
        setMarkers(prev => {
            const u = prev.map((m, idx) => idx === i ? { ...m, label } : m);
            syncMarkersOnMap(u);
            return u;
        });
    };

    const handleGenerate = async () => {
        if (!serverToken.trim() || !clientToken.trim()) {
            toast({ description: "Both tokens are required", variant: "destructive" });
            return;
        }
        setGenerating(true);
        try {
            const result = await generateMapEmbed({
                serverToken: serverToken.trim(),
                clientToken: clientToken.trim(),
                lat: center.lat, lng: center.lng,
                zoom: zoomRef.current,
                bounds: bounds ?? null,
                owner: currentUser?.user?.username,
            });
            setIframeSrc(result.iframeSrc);
            setTimeout(() => document.getElementById("embed-result")?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (e: any) {
            toast({ description: e.message ?? "Failed to generate embed", variant: "destructive" });
        } finally {
            setGenerating(false);
        }
    };

    const iframeSnippet = iframeSrc
        ? `<iframe\n  src="${iframeSrc}"\n  width="600"\n  height="450"\n  style="border:0;border-radius:8px"\n  allowfullscreen\n  loading="lazy"\n></iframe>`
        : "";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(iframeSnippet);
        setCopied(true);
        toast({ description: "Copied!" });
        setTimeout(() => setCopied(false), 2000);
    };

    const stepHeader = (step: number, title: string, description: string | null, optional = false) => (
        <CardHeader className="border-b border-line-strong">
            <CardTitle className="flex items-center gap-2">
                <span className="caption-style inline-flex size-5 items-center justify-center rounded-full bg-muted text-chip shadow-badge">{step}</span>
                {title}
                {optional && <span className="caption-style text-subtle">Optional</span>}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
    );

    const fileButtonClasses = "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong bg-secondary px-3 text-[12px] leading-none text-soft transition-colors duration-150 ease-power3-out hover:bg-muted hover:text-foreground [&_svg]:size-3.5";

    return (
        <Page className="max-w-[960px]">
            <PageIntro
                title="Map Embed"
                description="Paste your tokens, load the map, then click to configure center, markers, and an optional bounding box."
            />

            <Card>
                {stepHeader(1, "Service Account Tokens", "Use a service account's server and client tokens. They're exchanged for a token-free embed URL.")}
                <CardContent className="flex flex-col items-start gap-4 pt-5">
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Server Token" htmlFor="server-token">
                            <div className="flex gap-2">
                                <Input id="server-token" type={showServerToken ? "text" : "password"} placeholder="Paste server token..."
                                    value={serverToken} onChange={e => setServerToken(e.target.value)} />
                                <Button variant="secondary" size="icon" className="mt-[3px]"
                                    aria-label={showServerToken ? "Hide server token" : "Show server token"}
                                    onClick={() => setShowServerToken(v => !v)}>
                                    {showServerToken ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                                </Button>
                            </div>
                        </Field>
                        <Field label="Client Token" htmlFor="client-token">
                            <div className="flex gap-2">
                                <Input id="client-token" type={showClientToken ? "text" : "password"} placeholder="Paste client token..."
                                    value={clientToken} onChange={e => setClientToken(e.target.value)} />
                                <Button variant="secondary" size="icon" className="mt-[3px]"
                                    aria-label={showClientToken ? "Hide client token" : "Show client token"}
                                    onClick={() => setShowClientToken(v => !v)}>
                                    {showClientToken ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
                                </Button>
                            </div>
                        </Field>
                    </div>
                    <Button onClick={handleLoadMap} disabled={mapLoading || !serverToken.trim() || !clientToken.trim()} variant="secondary">
                        {mapLoading
                            ? <><Loader2 aria-hidden className="animate-spin" />Loading Map...</>
                            : mapLoaded
                                ? <><RotateCcw aria-hidden />Reload Map</>
                                : <><MapIcon aria-hidden />Load Map to Configure</>}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                {stepHeader(2, "Configure on Map", mapLoaded ? "Click to set center and drop markers" : "Load the map above to start configuring.")}
                <CardContent className="flex flex-col gap-3 pt-4">
                    {(mapLoaded || mapRef.current) && (
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant={mode === "center" ? "muted" : "ghost"} aria-pressed={mode === "center"} onClick={() => setMode("center")}>
                                <MousePointer aria-hidden className="text-[var(--ds-tag-blue-text)]" /> Set Center
                            </Button>
                            <Button size="sm" variant={mode === "marker" ? "muted" : "ghost"} aria-pressed={mode === "marker"} onClick={() => setMode("marker")}>
                                <MapIcon aria-hidden className="text-primary" /> Drop Marker
                            </Button>
                            <Button size="sm" variant={mode === "bounds" ? "muted" : "ghost"} aria-pressed={mode === "bounds"}
                                onClick={() => { handleClearBounds(); setMode("bounds"); toast({ description: "Click two opposite corners to draw the bounding box." }); }}>
                                <BoxSelect aria-hidden className="text-primary" />
                                {boundsCorner1 ? "Click 2nd corner…" : bounds ? "Redraw Bounds" : "Draw Bounds"}
                            </Button>
                            {bounds && mode !== "bounds" && (
                                <Button size="sm" variant="ghost" onClick={handleClearBounds} className="hover:text-danger">
                                    <RotateCcw aria-hidden /> Clear Bounds
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="relative h-[450px] overflow-hidden rounded-lg border border-line-strong">
                        <div ref={mapContainerRef} className="h-full w-full" />
                        {!mapLoaded && !mapLoading && !mapRef.current && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/40">
                                <MapIcon aria-hidden className="size-8 text-faint" />
                                <p className="caption-style text-subtle">Paste your tokens and click "Load Map to Configure"</p>
                            </div>
                        )}
                        {mapLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                                <Loader2 aria-hidden className="size-6 animate-spin text-primary" />
                            </div>
                        )}
                        {mapLoaded && (
                            <div className="caption-style pointer-events-none absolute bottom-3 left-3 flex flex-col gap-2 rounded-lg border border-line-strong bg-popover/90 px-3 py-2 text-foreground shadow-overlay backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 shrink-0 rounded-full border border-white bg-[var(--ds-tag-blue-text)]" />
                                    Center (draggable)
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                                    Markers
                                </div>
                                {bounds && (
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 shrink-0 border border-dashed border-primary" />
                                        Bounds active
                                    </div>
                                )}
                            </div>
                        )}
                        {pendingMarker && (
                            <div className="absolute left-1/2 top-3 z-20 flex w-72 -translate-x-1/2 flex-col gap-3 rounded-xl border border-line-strong bg-popover p-4 text-popover-foreground shadow-overlay">
                                <p className="caption-style tabular-nums text-subtle">
                                    {pendingMarker.lat.toFixed(5)}, {pendingMarker.lng.toFixed(5)}
                                </p>
                                <Input
                                    autoFocus
                                    aria-label="Place name"
                                    placeholder="Place name (optional)"
                                    value={pendingLabel}
                                    onChange={e => setPendingLabel(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && confirmPendingMarker()}
                                />
                                <label className={fileButtonClasses}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handlePendingImageUpload(file);
                                        }}
                                    />
                                    {pendingUploading
                                        ? <><Loader2 aria-hidden className="animate-spin" /> Uploading...</>
                                        : pendingImage
                                            ? <><img src={pendingImage} className="size-5 rounded object-cover" alt="" /> Image uploaded</>
                                            : <><ImagePlus aria-hidden /> Upload marker image</>}
                                </label>
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={cancelPendingMarker}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={confirmPendingMarker}>
                                        Add Place
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {mapLoaded && (
                        <div className="caption-style flex flex-wrap gap-x-4 gap-y-2 tabular-nums text-subtle">
                            <span>Center: <span className="text-soft">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span></span>
                            {bounds && (
                                <span>
                                    Bounds: <span className="text-soft">[{bounds.map(v => v.toFixed(4)).join(", ")}]</span>
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                {stepHeader(3, "Add Place Manually", "CSV columns: name (or location_name), lat/latitude, lng/longitude, type (or location_type)", true)}
                <CardContent className="flex flex-wrap items-center gap-2 pt-5">
                    <Input className="w-48" aria-label="Name" placeholder="Name" value={manualName} onChange={e => setManualName(e.target.value)} />
                    <Input className="w-32" aria-label="Latitude" placeholder="Latitude" value={manualLat} onChange={e => setManualLat(e.target.value)} />
                    <Input className="w-32" aria-label="Longitude" placeholder="Longitude" value={manualLng} onChange={e => setManualLng(e.target.value)} />
                    <Input className="w-32" aria-label="Type" placeholder="Type (optional)" value={manualType} onChange={e => setManualType(e.target.value)} />
                    <label className={fileButtonClasses} aria-label="Upload place image">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleManualImageUpload(file);
                            }}
                        />
                        {manualUploading
                            ? <Loader2 aria-hidden className="animate-spin" />
                            : manualImage
                                ? <img src={manualImage} className="size-5 rounded object-cover" alt="" />
                                : <ImagePlus aria-hidden />}
                    </label>
                    <Button variant="primary" onClick={handleManualAdd} disabled={manualSubmitting}>
                        {manualSubmitting ? <Loader2 aria-hidden className="animate-spin" /> : "Add"}
                    </Button>
                    <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
                    <label className={fileButtonClasses}>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleCsvUpload(file);
                            }}
                        />
                        {csvUploading
                            ? <><Loader2 aria-hidden className="animate-spin" /> Uploading CSV...</>
                            : <><UploadCloud aria-hidden /> Upload CSV</>}
                    </label>
                </CardContent>
            </Card>

            {markers.length > 0 && (
                <Card>
                    {stepHeader(4, "Marker Labels", null, true)}
                    <CardContent className="flex flex-col gap-3 pt-4">
                        <ul className="divide-y divide-line-strong">
                            {markers.slice(0, visibleMarkerCount).map((m, i) => (
                                <li key={i} className="flex items-center gap-2 py-2">
                                    <span className="caption-style w-36 shrink-0 tabular-nums text-subtle">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                                    <Input className="h-8 flex-1 text-[12px]"
                                        aria-label={`Label for marker ${i + 1}`}
                                        placeholder="Label (optional)" value={m.label ?? ""}
                                        onChange={e => updateMarkerLabel(i, e.target.value)} />

                                    {m.image ? (
                                        <img src={m.image} alt="" className="size-7 shrink-0 rounded object-cover" />
                                    ) : (
                                        <label className="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full text-subtle transition-colors duration-150 ease-power3-out hover:bg-hover hover:text-foreground" aria-label={`Upload image for marker ${i + 1}`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleMarkerImageUpload(i, file);
                                                }}
                                            />
                                            {uploadingIndex === i
                                                ? <Loader2 aria-hidden className="size-3.5 animate-spin" />
                                                : <ImagePlus aria-hidden className="size-3.5" />}
                                        </label>
                                    )}

                                    <Button size="icon" variant="ghost" className="hover:text-danger" aria-label={`Remove marker ${i + 1}`}
                                        onClick={() => removeMarker(i)}>
                                        <Trash2 aria-hidden />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        {visibleMarkerCount < markers.length && (
                            <Button size="sm" variant="secondary" className="self-center"
                                onClick={() => setVisibleMarkerCount(c => c + 5)}>
                                Load More ({markers.length - visibleMarkerCount} remaining)
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <div>
                <Button variant="primary" size="lg" onClick={handleGenerate}
                    disabled={generating || !serverToken.trim() || !clientToken.trim()}>
                    {generating
                        ? <><Loader2 aria-hidden className="animate-spin" />Generating...</>
                        : "Generate Embed"}
                </Button>
            </div>

            {iframeSrc && (
                <Card id="embed-result">
                    <CardHeader className="border-b border-line-strong">
                        <CardTitle>Embed Preview</CardTitle>
                        <CardDescription>This URL contains no raw tokens. Safe to share publicly.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 pt-4">
                        <div className="overflow-hidden rounded-lg border border-line-strong">
                            <iframe src={iframeSrc} width="100%" height="420" title="Map embed preview"
                                style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Copy & paste on any website</Label>
                            <div className="relative">
                                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line-strong bg-secondary p-4 pr-12 font-mono text-[12px] leading-[1.5] text-soft">
                                    {iframeSnippet}
                                </pre>
                                <Button variant="secondary" size="icon-sm" onClick={handleCopy}
                                    aria-label={copied ? "Copied" : "Copy embed code"}
                                    className="absolute right-3 top-3">
                                    {copied ? <Check aria-hidden className="text-success" /> : <Copy aria-hidden />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </Page>
    );
}
