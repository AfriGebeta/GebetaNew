"use client";

import { generateMapEmbed, type Marker } from "@/app/actions/map-embed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadMarkerImage } from "@/lib/upload";
import {
    BoxSelect,
    Check,
    Copy,
    EyeIcon, EyeOffIcon,
    ImagePlus,
    Loader2,
    Map,
    MousePointer, RotateCcw,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createExternalPlace, createManyExternalPlaces, getAllExternalPlaces } from "@/lib/external";
import { AuthContext } from "@/providers/AuthProvider";

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

    const syncMarkersOnMap = useCallback((newMarkers: Marker[]) => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (!mapRef.current) return;
        newMarkers.forEach(m => {
            const el = document.createElement("div");
            if (m.image) {
                el.style.cssText = "width:32px;height:32px;border-radius:50%;background-size:cover;background-position:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);background-image:url(" + m.image + ")";
            } else {
                el.style.cssText = "width:28px;height:28px;border-radius:50% 50% 50% 0;background:#FFA500;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);";
            }
            const marker = new (window as any).maplibregl.Marker({ element: el })
                .setLngLat([m.lng, m.lat]).addTo(mapRef.current);
            if (m.label) marker.setPopup(new (window as any).maplibregl.Popup().setText(m.label));
            markersRef.current.push(marker);
        });
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
        el.style.cssText = "width:20px;height:20px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:move;";
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
                paint: { "fill-color": "#FFA500", "fill-opacity": 0.08 },
            });
            mapRef.current.addLayer({
                id: "bounds-line", type: "line", source: "bounds-preview",
                paint: { "line-color": "#FFA500", "line-width": 2, "line-dasharray": [4, 2] },
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

    return (
        <div className="p-4 md:p-6 mt-2 max-w-5xl">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Map Embed</h2>
                <p className="text-[#aaa]">
                    Paste your tokens, load the map, then click to configure center, markers, and an optional bounding box.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <Label>1. Service Account Tokens</Label>
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Server Token</Label>
                            <div className="flex gap-2">
                                <Input type={showServerToken ? "text" : "password"} placeholder="Paste server token..."
                                    value={serverToken} onChange={e => setServerToken(e.target.value)} />
                                <Button variant="outline" size="icon" className="border-white/10 bg-transparent shrink-0"
                                    onClick={() => setShowServerToken(v => !v)}>
                                    {showServerToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Client Token</Label>
                            <div className="flex gap-2">
                                <Input type={showClientToken ? "text" : "password"} placeholder="Paste client token..."
                                    value={clientToken} onChange={e => setClientToken(e.target.value)} />
                                <Button variant="outline" size="icon" className="border-white/10 bg-transparent shrink-0"
                                    onClick={() => setShowClientToken(v => !v)}>
                                    {showClientToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleLoadMap} disabled={mapLoading || !serverToken.trim() || !clientToken.trim()}
                        variant="outline" className="border-white/10 bg-transparent hover:bg-white/10">
                        {mapLoading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading Map...</>
                            : mapLoaded
                                ? <><RotateCcw className="w-4 h-4 mr-2" />Reload Map</>
                                : <><Map className="w-4 h-4 mr-2" />Load Map to Configure</>}
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label>2. Configure on Map</Label>
                    <p className="text-sm text-[#aaa]">
                        {mapLoaded
                            ? "Click to set center and drop markers"
                            : "Load the map above to start configuring."}
                    </p>

                    {(mapLoaded || mapRef.current) && (
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => setMode("center")}
                                className={`text-xs border-white/10 bg-transparent ${mode === "center" ? "border-[#3B82F6] text-[#3B82F6]" : ""}`}>
                                <MousePointer className="w-3 h-3 mr-1" /> Set Center
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setMode("marker")}
                                className={`text-xs border-white/10 bg-transparent ${mode === "marker" ? "border-[#FFA500] text-[#FFA500]" : ""}`}>
                                <Map className="w-3 h-3 mr-1" /> Drop Marker
                            </Button>
                            <Button size="sm" variant="outline"
                                onClick={() => { handleClearBounds(); setMode("bounds"); toast({ description: "Click two opposite corners to draw the bounding box." }); }}
                                className={`text-xs border-white/10 bg-transparent ${mode === "bounds" ? "border-[#FFA500] text-[#FFA500]" : bounds ? "border-orange-400 text-orange-400" : ""}`}>
                                <BoxSelect className="w-3 h-3 mr-1" />
                                {boundsCorner1 ? "Click 2nd corner…" : bounds ? "Redraw Bounds" : "Draw Bounds"}
                            </Button>
                            {bounds && mode !== "bounds" && (
                                <Button size="sm" variant="outline" onClick={handleClearBounds}
                                    className="text-xs border-white/10 text-red-400 bg-transparent">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Clear Bounds
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 450 }}>
                        <div ref={mapContainerRef} className="w-full h-full" />
                        {!mapLoaded && !mapLoading && !mapRef.current && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] gap-3">
                                <Map className="w-10 h-10 text-white/20" />
                                <p className="text-[#555]">Paste your tokens and click "Load Map to Configure"</p>
                            </div>
                        )}
                        {mapLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                                <Loader2 className="w-8 h-8 text-[#FFA500] animate-spin" />
                            </div>
                        )}
                        {mapLoaded && (
                            <div className="absolute bottom-3 left-3 bg-black/70 rounded-lg px-3 py-2 text-xs space-y-1 pointer-events-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white shrink-0" />
                                    <span className="text-white">Center (draggable)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FFA500] shrink-0" />
                                    <span className="text-white">Markers</span>
                                </div>
                                {bounds && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-dashed border-[#FFA500] shrink-0" />
                                        <span className="text-orange-400">Bounds active</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {pendingMarker && (
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-2xl p-4 w-72">
                                <p className="text-xs text-[#aaa] mb-3">
                                    {pendingMarker.lat.toFixed(5)}, {pendingMarker.lng.toFixed(5)}
                                </p>
                                <div className="space-y-2 mb-3">
                                    <Input
                                        autoFocus
                                        placeholder="Place name (optional)"
                                        value={pendingLabel}
                                        onChange={e => setPendingLabel(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && confirmPendingMarker()}
                                    />
                                    <label className="flex items-center gap-2 cursor-pointer text-xs rounded-lg px-3 py-2">
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
                                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                                            : pendingImage
                                                ? <><img src={pendingImage} className="w-5 h-5 rounded object-cover" alt="" /> Image uploaded ✓</>
                                                : <><ImagePlus className="w-3.5 h-3.5" /> Upload marker image</>}
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={confirmPendingMarker}
                                        className="flex-1 text-white hover:bg-[#ffa500]">
                                        Add Place
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelPendingMarker}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {mapLoaded && (
                        <div className="flex gap-4 text-xs text-[#aaa]">
                            <span>Center: {center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span>
                            {bounds && (
                                <span className="text-orange-400">
                                    Bounds: [{bounds.map(v => v.toFixed(4)).join(", ")}] ✓
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>3. Add Place Manually <span className="text-[#aaa] font-normal">(optional)</span></Label>
                    <div className="flex gap-2 flex-wrap items-center">
                        <Input className="w-48" placeholder="Name" value={manualName} onChange={e => setManualName(e.target.value)} />
                        <Input className="w-32" placeholder="Latitude" value={manualLat} onChange={e => setManualLat(e.target.value)} />
                        <Input className="w-32" placeholder="Longitude" value={manualLng} onChange={e => setManualLng(e.target.value)} />
                        <Input className="w-32" placeholder="Type (optional)" value={manualType} onChange={e => setManualType(e.target.value)} />
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#aaa] border border-white/10 rounded-lg px-3 py-2 h-9">
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
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : manualImage
                                    ? <img src={manualImage} className="w-5 h-5 rounded object-cover" alt="" />
                                    : <ImagePlus className="w-3.5 h-3.5" />}
                        </label>
                        <Button size="sm" onClick={handleManualAdd} disabled={manualSubmitting}
                            className="bg-[#FFA500] text-black font-semibold hover:bg-[#FF8C00]">
                            {manualSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                        </Button>
                        <label className="flex items-center gap-2 cursor-pointer text-xs border border-white/10 rounded-lg px-3 py-2 h-9">
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
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading CSV...</>
                                : <><UploadCloud className="w-3.5 h-3.5" /> Upload CSV</>}
                        </label>
                    </div>
                    <p className="text-xs text-[#555]">
                        CSV columns: name (or location_name), lat/latitude, lng/longitude, type (or location_type)
                    </p>
                </div>

                {markers.length > 0 && (
                    <div className="space-y-2">
                        <Label>4. Marker Labels <span className="text-[#aaa] font-normal">(optional)</span></Label>
                        <div className="space-y-2">
                            {markers.map((m, i) => (
                                <div key={i} className="flex gap-2 items-center border border-white/10 rounded-lg p-2">
                                    <span className="text-xs text-[#aaa] w-36 shrink-0">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                                    <Input className="bg-transparent border-white/10 text-xs placeholder:text-[#555] flex-1"
                                        placeholder="Label (optional)" value={m.label ?? ""}
                                        onChange={e => updateMarkerLabel(i, e.target.value)} />

                                    {m.image ? (
                                        <img src={m.image} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                                    ) : (
                                        <label className="cursor-pointer shrink-0">
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
                                                ? <Loader2 className="w-4 h-4 animate-spin text-[#aaa]" />
                                                : <ImagePlus className="w-4 h-4 text-[#aaa] hover:text-white" />}
                                        </label>
                                    )}

                                    <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 h-8 w-8 shrink-0"
                                        onClick={() => removeMarker(i)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button onClick={handleGenerate}
                    disabled={generating || !serverToken.trim() || !clientToken.trim()}
                    className="bg-[#FFA500] text-black font-semibold hover:bg-[#FF8C00] w-full sm:w-auto">
                    {generating
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                        : "Generate Embed"}
                </Button>

                {iframeSrc && (
                    <div id="embed-result" className="space-y-4 pt-2">
                        <Label>Embed Preview</Label>
                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <iframe src={iframeSrc} width="100%" height="420"
                                style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
                        </div>
                        <div className="space-y-1">
                            <Label>Copy & paste on any website</Label>
                            <div className="relative">
                                <pre className="bg-[#111] border border-white/10 rounded-lg p-4 text-xs text-[#aaa] overflow-x-auto whitespace-pre-wrap font-mono">
                                    {iframeSnippet}
                                </pre>
                                <button onClick={handleCopy}
                                    className="absolute top-3 right-3 p-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/10">
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-[#aaa]">This URL contains no raw tokens. Safe to share publicly.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}