// app/dashboard/map-embed/page.tsx
"use client";

import { useState, useContext } from "react";
import { generateMapEmbed, type Marker } from "@/app/action/map-embed";
import { AuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Map, Plus, Trash2, EyeIcon, EyeOffIcon } from "lucide-react";

export default function MapEmbedPage() {
    const { currentUser } = useContext(AuthContext);
    const { toast } = useToast();

    const [manualToken, setManualToken] = useState("");
    const [showToken, setShowToken] = useState(false);

    const [lat, setLat] = useState("9.0161");
    const [lng, setLng] = useState("38.7685");
    const [zoom, setZoom] = useState("13");
    const [markers, setMarkers] = useState<Marker[]>([]);

    const [iframeSrc, setIframeSrc] = useState("");
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const addMarker = () => {
        setMarkers((prev) => [...prev, { lat: parseFloat(lat), lng: parseFloat(lng), label: "" }]);
    };

    const removeMarker = (i: number) => {
        setMarkers((prev) => prev.filter((_, idx) => idx !== i));
    };

    const updateMarker = (i: number, field: "lat" | "lng" | "label", value: string) => {
        setMarkers((prev) =>
            prev.map((m, idx) =>
                idx === i ? { ...m, [field]: field === "label" ? value : parseFloat(value) } : m
            )
        );
    };

    const handleGenerate = async () => {
        if (!manualToken.trim()) {
            toast({ description: "Please paste your service account token", variant: "destructive" });
            return;
        }
        setGenerating(true);
        try {
            const result = await generateMapEmbed({
                clientToken: manualToken.trim(),
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                zoom: parseFloat(zoom),
                markers,
            });
            setIframeSrc(result.iframeSrc);
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
        toast({ description: "iframe snippet copied!" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="text-[#aaa] p-4 md:p-6 mt-2 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                    <Map className="w-5 h-5 text-[#FFA500]" />
                    Map Embed
                </h2>
                <p className="text-sm text-[#aaa]">
                    Generate a shareable map iframe for any website. Your service account token is used server-side only — never exposed in the iframe URL.
                </p>
            </div>

            <div className="space-y-6">

                {/* Step 1 — Token */}
                <div className="space-y-2">
                    <Label className="text-white text-sm">1. Service Account Token</Label>
                    <p className="text-xs text-[#aaa]">
                        Paste the token shown once when you created your service account. It stays on our server and is never included in the iframe URL.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            className="bg-transparent border-white/10 text-white font-mono text-xs flex-1 placeholder:text-[#555]"
                            type={showToken ? "text" : "password"}
                            placeholder="Paste your service account token..."
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="border-white/10 text-[#aaa] hover:text-white bg-transparent shrink-0"
                            onClick={() => setShowToken((v) => !v)}
                        >
                            {showToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Step 2 — Map center */}
                <div className="space-y-2">
                    <Label className="text-white text-sm">2. Map Center & Zoom</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Latitude", value: lat, setter: setLat, placeholder: "9.0161" },
                            { label: "Longitude", value: lng, setter: setLng, placeholder: "38.7685" },
                            { label: "Zoom (1–20)", value: zoom, setter: setZoom, placeholder: "13" },
                        ].map(({ label, value, setter, placeholder }) => (
                            <div key={label} className="space-y-1">
                                <Label className="text-xs text-[#aaa]">{label}</Label>
                                <Input
                                    className="bg-transparent border-white/10 text-white placeholder:text-[#555]"
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 3 — Markers */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-white text-sm">3. Markers (optional)</Label>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-white/10 text-[#aaa] hover:text-white bg-transparent"
                            onClick={addMarker}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Marker
                        </Button>
                    </div>

                    {markers.length === 0 && (
                        <p className="text-xs text-[#555]">No markers added. Map will show the center point only.</p>
                    )}

                    <div className="space-y-2">
                        {markers.map((m, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center border border-white/10 rounded-lg p-2"
                            >
                                <Input
                                    className="bg-transparent border-white/10 text-white text-xs placeholder:text-[#555]"
                                    placeholder="Lat"
                                    value={m.lat}
                                    onChange={(e) => updateMarker(i, "lat", e.target.value)}
                                />
                                <Input
                                    className="bg-transparent border-white/10 text-white text-xs placeholder:text-[#555]"
                                    placeholder="Lng"
                                    value={m.lng}
                                    onChange={(e) => updateMarker(i, "lng", e.target.value)}
                                />
                                <Input
                                    className="bg-transparent border-white/10 text-white text-xs placeholder:text-[#555]"
                                    placeholder="Label (optional)"
                                    value={m.label ?? ""}
                                    onChange={(e) => updateMarker(i, "label", e.target.value)}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 h-8 w-8"
                                    onClick={() => removeMarker(i)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Generate */}
                <Button
                    onClick={handleGenerate}
                    disabled={generating || !manualToken.trim()}
                    className="bg-[#FFA500] text-white hover:bg-[#FF8C00] w-full sm:w-auto"
                >
                    {generating ? "Generating..." : "Generate Embed"}
                </Button>

                {/* Result */}
                {iframeSrc && (
                    <div className="space-y-4 pt-2">
                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <iframe
                                src={iframeSrc}
                                width="100%"
                                height="420"
                                style={{ border: 0, display: "block" }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-white text-sm">Copy & paste this on any website</Label>
                            <div className="relative">
                                <pre className="bg-[#111] border border-white/10 rounded-lg p-4 text-xs text-[#aaa] overflow-x-auto whitespace-pre-wrap font-mono">
                                    {iframeSnippet}
                                </pre>
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 p-1.5 rounded bg-white/10 hover:bg-white/20 border border-white/10"
                                >
                                    {copied
                                        ? <Check className="w-4 h-4 text-green-400" />
                                        : <Copy className="w-4 h-4 text-[#aaa]" />
                                    }
                                </button>
                            </div>
                            <p className="text-xs text-[#555]">
                                This URL contains no tokens or API keys. Safe to share publicly.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}