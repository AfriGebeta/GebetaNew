import { NextRequest, NextResponse } from "next/server";
import { createEmbedToken } from "@/lib/map-embed-store";

export async function POST(req: NextRequest) {
  try {
    const {
      serverToken, clientToken,
      lat = 9.0161, lng = 38.7685, zoom = 13,
      minZoom = 1, maxZoom = 22,
      markers = [],
      bounds = null,
    } = await req.json();

    if (!serverToken || !clientToken) {
      return NextResponse.json({ error: "Both tokens required" }, { status: 400 });
    }

    const token = await createEmbedToken({
      serverToken, clientToken,
      lat, lng, zoom,
      minZoom, maxZoom,
      markers,
      bounds,
    });

    const baseUrl = "https://gebeta.app";
    return NextResponse.json({
      iframeSrc: `${baseUrl}/embed/map?t=${encodeURIComponent(token)}`,
      embedId: token,
    });
  } catch (err) {
    console.error("[map-embed POST]", err);
    return NextResponse.json({ error: "Failed to create embed" }, { status: 500 });
  }
}