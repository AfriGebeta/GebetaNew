import { NextRequest, NextResponse } from "next/server";
import { TILES_ORIGIN, clientIp, gebetaKey, rateLimited } from "@/lib/gebeta-api";

export const dynamic = "force-dynamic";

/** Only map resources are proxied; anything else on the tile host stays unreachable through us. */
const ALLOWED = /^(tiles|sprite|fonts|styles)\//;
const TILE_REQUESTS_PER_MINUTE = 1200;
const CACHE = {
    styles: "public, max-age=3600, s-maxage=3600",
    asset: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    const key = gebetaKey();
    if (!key) return NextResponse.json({ error: "Map is not configured" }, { status: 503 });

    // Font stacks look like "Open Sans Regular,Arial Unicode MS Regular", so commas stay literal.
    const path = params.path.map((segment) => encodeURIComponent(segment).replace(/%2C/gi, ",")).join("/");
    if (!ALLOWED.test(path) || path.includes("..")) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rateLimited(`tiles:${clientIp(req)}`, TILE_REQUESTS_PER_MINUTE)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const upstream = await fetch(`${TILES_ORIGIN}/${path}?apiKey=${encodeURIComponent(key)}`, { cache: "no-store" });
    if (!upstream.ok) return new NextResponse(null, { status: upstream.status });

    return new NextResponse(upstream.body, {
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
            "Cache-Control": path.startsWith("styles/") ? CACHE.styles : CACHE.asset,
        },
    });
}
