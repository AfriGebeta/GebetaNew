"use client";

import { useState, useEffect, useRef } from "react";
import { generateMapEmbed, type Marker } from "@/app/actions/map-embed";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Map, Trash2, EyeIcon, EyeOffIcon, MousePointer, Pentagon, RotateCcw, Loader2 } from "lucide-react";

export default function MapEmbedPage() {
    const { toast } = useToast();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const gebetaMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const centerMarkerRef = useRef<any>(null);
    const fencePointsRef = useRef<Array<[number, number]>>([]);

    const [serverToken, setServerToken] = useState("");
    const [clientToken, setClientToken] = useState("");
    const [showServerToken, setShowServerToken] = useState(false);
    const [showClientToken, setShowClientToken] = useState(false);

    const [mapLoading, setMapLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const [center, setCenter] = useState({ lat: 9.0161, lng: 38.7685 });
    const [zoom, setZoom] = useState(13);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [mode, setMode] = useState<"center" | "marker" | "fence">("center");

    const [fenceCoords, setFenceCoords] = useState<Array<[number, number]> | null>(null);
    const [fencePoints, setFencePoints] = useState<Array<[number, number]>>([]);
    const [fenceDrawing, setFenceDrawing] = useState(false);

    const [iframeSrc, setIframeSrc] = useState("");
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if ((window as any).GebetaMaps) return;
        const script = document.createElement("script");
        script.src = "https://tiles.gebeta.app/static/v3/gebeta-maps.umd.js";
        document.head.appendChild(script);
    }, []);

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
                const iv = setInterval(() => { if ((window as any).GebetaMaps) { clearInterval(iv); resolve(); } }, 100);
            });

            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

            const gebeta = new (window as any).GebetaMaps({ auth: { accessToken, refreshToken } });
            gebetaMapRef.current = gebeta;
            const map = gebeta.init({
                container: mapContainerRef.current,
                center: [center.lng, center.lat],
                zoom,
                navigationControl: true,
            });
            mapRef.current = map;
            map.on("load", () => {
                setMapReady(true);
                setMapLoaded(true);
                addCenterMarker(center.lat, center.lng);
                toast({ description: "Map loaded! Click to configure." });
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

    const syncMarkersOnMap = (newMarkers: Marker[]) => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (!mapRef.current) return;
        newMarkers.forEach(m => {
            const el = document.createElement("div");
            el.style.cssText = "width:28px;height:28px;border-radius:50% 50% 50% 0;background:#FFA500;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);";
            const marker = new (window as any).maplibregl.Marker({ element: el })
                .setLngLat([m.lng, m.lat]).addTo(mapRef.current);
            if (m.label) marker.setPopup(new (window as any).maplibregl.Popup().setText(m.label));
            markersRef.current.push(marker);
        });
    };

    const drawFenceOnMap = (points: Array<[number, number]>, closed = false) => {
        if (!mapRef.current) return;
        const coords = closed ? points : points;
        const geojson: any = closed
            ? { type: "Feature", geometry: { type: "Polygon", coordinates: [[...coords, coords[0]]] } }
            : { type: "Feature", geometry: { type: "LineString", coordinates: coords } };

        if (mapRef.current.getSource("fence-preview")) {
            mapRef.current.getSource("fence-preview").setData(geojson);
        } else {
            mapRef.current.addSource("fence-preview", { type: "geojson", data: geojson });
            if (closed) {
                mapRef.current.addLayer({ id: "fence-fill", type: "fill", source: "fence-preview", paint: { "fill-color": "#FFA500", "fill-opacity": 0.12 } });
            }
            mapRef.current.addLayer({ id: "fence-line", type: "line", source: "fence-preview", paint: { "line-color": "#FFA500", "line-width": 2, "line-dasharray": [4, 2] } });
        }
    };

    const clearFenceFromMap = () => {
        if (!mapRef.current) return;
        ["fence-fill", "fence-line"].forEach(l => { try { if (mapRef.current.getLayer(l)) mapRef.current.removeLayer(l); } catch {} });
        try { if (mapRef.current.getSource("fence-preview")) mapRef.current.removeSource("fence-preview"); } catch {}
    };

    // Map click
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const map = mapRef.current;
        const handleClick = (e: any) => {
            const { lng, lat } = e.lngLat;

            if (mode === "fence") {
                const newPoint: [number, number] = [lng, lat];
                const updated = [...fencePointsRef.current, newPoint];
                fencePointsRef.current = updated;
                setFencePoints([...updated]);
                clearFenceFromMap();
                drawFenceOnMap(updated, false);
                return;
            }
            if (mode === "center") {
                setCenter({ lat, lng });
                addCenterMarker(lat, lng);
                map.flyTo({ center: [lng, lat] });
            } else if (mode === "marker") {
                setMarkers(prev => {
                    const updated = [...prev, { lat, lng, label: "" }];
                    syncMarkersOnMap(updated);
                    return updated;
                });
            }
        };
        map.on("click", handleClick);
        return () => map.off("click", handleClick);
    }, [mapReady, mode, fencePoints]);

    // Cursor
    useEffect(() => {
        if (!mapRef.current) return;
        const canvas = mapRef.current.getCanvas();
        if (mode === "fence") canvas.style.cursor = "crosshair";
        else if (mode === "marker") canvas.style.cursor = "cell";
        else canvas.style.cursor = "";
    }, [mode, mapReady]);

    const handleCloseFence = () => {
        if (fencePointsRef.current.length < 3) {
            toast({ description: "Add at least 3 points to close the fence.", variant: "destructive" });
            return;
        }
        const closed = [...fencePointsRef.current, fencePointsRef.current[0]];
        setFenceCoords(closed);
        clearFenceFromMap();
        drawFenceOnMap(closed, true);
        setFenceDrawing(false);
        setMode("center");
        toast({ description: "Fence closed! Users won't be able to pan outside this area." });
    };

    const handleClearFence = () => {
        fencePointsRef.current = [];
        setFencePoints([]);
        setFenceCoords(null);
        setFenceDrawing(false);
        setMode("center");
        clearFenceFromMap();
    };

    const handleStartFence = () => {
        handleClearFence();
        setFenceDrawing(true);
        setMode("fence");
        toast({ description: "Click points on the map to draw your fence area. Click 'Close Fence' when done." });
    };

    const removeMarker = (i: number) => {
        setMarkers(prev => { const u = prev.filter((_, idx) => idx !== i); syncMarkersOnMap(u); return u; });
    };

    const updateMarkerLabel = (i: number, label: string) => {
        setMarkers(prev => { const u = prev.map((m, idx) => idx === i ? { ...m, label } : m); syncMarkersOnMap(u); return u; });
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
                lat: center.lat, lng: center.lng, zoom, markers,
                fenceCoords: fenceCoords ?? null,
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
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Map Embed
                </h2>
                <p className="text-[#aaa]">
                    Paste your tokens, load the map, then click to configure center, markers, and fencing area.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="">1. Service Account Tokens</Label>
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Server Token <span className="text-[#aaa]"></span></Label>
                            <div className="flex gap-2">
                                <Input type={showServerToken ? "text" : "password"} placeholder="Paste server token..." value={serverToken} onChange={e => setServerToken(e.target.value)} />
                                <Button variant="outline" size="icon" className="border-white/10 bg-transparent shrink-0" onClick={() => setShowServerToken(v => !v)}>
                                    {showServerToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Client Token <span className="text-[#aaa]"></span></Label>
                            <div className="flex gap-2">
                                <Input type={showClientToken ? "text" : "password"} placeholder="Paste client token..." value={clientToken} onChange={e => setClientToken(e.target.value)} />
                                <Button variant="outline" size="icon" className="border-white/10 bg-transparent shrink-0" onClick={() => setShowClientToken(v => !v)}>
                                    {showClientToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleLoadMap} disabled={mapLoading || !serverToken.trim() || !clientToken.trim()} variant="outline" className="border-white/10 bg-transparent hover:bg-white/10">
                        {mapLoading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading Map...</>
                            : mapLoaded
                                ? <><RotateCcw className="w-4 h-4 mr-2" />Reload Map</>
                                : <><Map className="w-4 h-4 mr-2" />Load Map to Configure</>
                        }
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label className="">2. Configure on Map</Label>
                    <p className="text-sm text-[#aaa]">
                        {mapLoaded ? "Click to set center, drop markers, or draw a fence to restrict panning." : "Load the map above to start configuring."}
                    </p>

                    {mapLoaded && (
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => { setMode("center"); }}
                                className={`text-xs border-white/10 bg-transparent ${mode === "center" ? "border-[#3B82F6] text-[#3B82F6]" : ""}`}>
                                <MousePointer className="w-3 h-3 mr-1" /> Set Center
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setMode("marker")}
                                className={`text-xs border-white/10 bg-transparent ${mode === "marker" ? "border-[#FFA500] text-[#FFA500]" : ""}`}>
                                <Map className="w-3 h-3 mr-1" /> Drop Marker
                            </Button>
                            {/* {!fenceDrawing ? (
                                <Button disabled size="sm" variant="outline" onClick={handleStartFence}
                                    className={`text-xs border-white/10 bg-transparent ${fenceCoords ? "border-orange-400 text-orange-400" : ""}`}>
                                    <Pentagon className="w-3 h-3 mr-1" />
                                    {fenceCoords ? "Redraw Fence" : "Draw Fence"}
                                </Button>
                            ) : (
                                <>
                                    <Button size="sm" variant="outline" onClick={handleCloseFence}
                                        className="text-xs border-green-400 text-green-400 bg-transparent">
                                        <Pentagon className="w-3 h-3 mr-1" />
                                        Close Fence ({fencePoints.length} pts)
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleClearFence}
                                        className="text-xs border-white/10 text-red-400 bg-transparent">
                                        Cancel
                                    </Button>
                                </>
                            )} */}
                            {fenceCoords && !fenceDrawing && (
                                <Button size="sm" variant="outline" onClick={handleClearFence}
                                    className="text-xs border-white/10 text-red-400 bg-transparent">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Clear Fence
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 450 }}>
                        <div ref={mapContainerRef} className="w-full h-full" />
                        {!mapLoaded && !mapLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] gap-3">
                                <Map className="w-10 h-10 text-white/20" />
                                <p className=" text-[#555]">Paste your tokens and click "Load Map to Configure"</p>
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
                                {fenceCoords && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-dashed border-[#FFA500] shrink-0" />
                                        <span className="text-orange-400">Fence active</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {mapLoaded && (
                        <div className="flex gap-4 text-xs text-[#aaa]">
                            <span>Center: {center.lat.toFixed(5)}, {center.lng.toFixed(5)}</span>
                            <span>Zoom: {zoom}</span>
                            {fenceCoords && <span className="text-orange-400">Fence active ({fenceCoords.length - 1} points) ✓</span>}
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <Label className="">3. Default Zoom</Label>
                    <Input className="bg-transparent border-white/10 placeholder:text-[#555] w-32" type="number" min={1} max={20} value={zoom} onChange={e => setZoom(parseInt(e.target.value) || 13)} />
                </div>

                {markers.length > 0 && (
                    <div className="space-y-2">
                        <Label className="">4. Marker Labels <span className="text-[#aaa] font-normal">(optional)</span></Label>
                        <div className="space-y-2">
                            {markers.map((m, i) => (
                                <div key={i} className="flex gap-2 items-center border border-white/10 rounded-lg p-2">
                                    <span className="text-xs text-[#aaa] w-36 shrink-0">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span>
                                    <Input className="bg-transparent border-white/10 text-xs placeholder:text-[#555] flex-1" placeholder="Label (optional)" value={m.label ?? ""} onChange={e => updateMarkerLabel(i, e.target.value)} />
                                    <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 h-8 w-8 shrink-0" onClick={() => removeMarker(i)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button onClick={handleGenerate} disabled={generating || !serverToken.trim() || !clientToken.trim()} className="bg-[#FFA500] text-black font-semibold hover:bg-[#FF8C00] w-full sm:w-auto">
                    {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate Embed"}
                </Button>

                {iframeSrc && (
                    <div id="embed-result" className="space-y-4 pt-2">
                        <Label className="">Embed Preview</Label>
                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <iframe src={iframeSrc} width="100%" height="420" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
                        </div>
                        <div className="space-y-1">
                            <Label className="">Copy & paste on any website</Label>
                            <div className="relative">
                                <pre className="bg-[#111] border border-white/10 rounded-lg p-4 text-xs text-[#aaa] overflow-x-auto whitespace-pre-wrap font-mono">{iframeSnippet}</pre>
                                <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/10">
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