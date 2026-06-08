import { NextRequest, NextResponse } from "next/server";
import { setEmbedSession, getEmbedSession, mintTokens } from "@/lib/map-embed-store";

export async function POST(req: NextRequest) {
    try {
        const { clientToken, lat = 9.0161, lng = 38.7685, zoom = 13, markers = [] } = await req.json();
        if (!clientToken) return NextResponse.json({ error: "clientToken is required" }, { status: 400 });

        const embedId = crypto.randomUUID();
        setEmbedSession(embedId, { clientToken, lat, lng, zoom, markers, createdAt: Date.now() });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        return NextResponse.json({ iframeSrc: `${baseUrl}/embed/map/${embedId}`, embedId });
    } catch (err) {
        console.error("[map-embed POST]", err);
        return NextResponse.json({ error: "Failed to create embed" }, { status: 500 });
    }
}