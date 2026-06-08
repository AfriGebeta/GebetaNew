// app/embed/map/page.tsx
// This page is designed to be loaded inside an <iframe>
import { Suspense } from "react";
import EmbedMapClient from "./EmbedMapClient";

export default function EmbedMapPage() {
    return (
        <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
            <EmbedMapClient />
        </Suspense>
    );
}