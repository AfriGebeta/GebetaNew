// app/embed/map/EmbedMapClient.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function EmbedMapClient() {
    const searchParams = useSearchParams();
    const mapRef = useRef<HTMLDivElement>(null);

    const accessToken = searchParams.get("accessToken") ?? "";
    const refreshToken = searchParams.get("refreshToken") ?? "";
    const lat = parseFloat(searchParams.get("lat") ?? "9.0161");
    const lng = parseFloat(searchParams.get("lng") ?? "38.7685");
    const zoom = parseFloat(searchParams.get("zoom") ?? "13");
    const markers: Array<{ lat: number; lng: number; label?: string }> =
        JSON.parse(searchParams.get("markers") ?? "[]");

    useEffect(() => {
        if (!mapRef.current || !accessToken) return;

        // Dynamically load the Gebeta UMD bundle (no API key in bundle URL)
        const script = document.createElement("script");
        script.src = "https://tiles.gebeta.app/static/v3/gebeta-maps.umd.js";
        script.onload = () => {
            const GebetaMaps = (window as any).GebetaMaps;
            const gebetaMap = new GebetaMaps({ auth: { accessToken, refreshToken } });

            const map = gebetaMap.init({
                container: mapRef.current!,
                center: [lng, lat],
                zoom,
                navigationControl: true,
            });

            // Add markers
            markers.forEach(({ lat: mLat, lng: mLng, label }) => {
                const el = document.createElement("div");
                el.style.cssText = `
                    width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
                    background: #e63946; transform: rotate(-45deg);
                    border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                `;

                const MapboxMarker = (window as any).maplibregl?.Marker;
                if (MapboxMarker) {
                    new MapboxMarker({ element: el })
                        .setLngLat([mLng, mLat])
                        .addTo(map);
                }
            });
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [accessToken, refreshToken, lat, lng, zoom]);

    return (
        <div
            ref={mapRef}
            style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}
        />
    );
}