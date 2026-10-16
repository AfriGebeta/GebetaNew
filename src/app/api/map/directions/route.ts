import { NextRequest, NextResponse } from "next/server";
import { clientIp, directions, parseLatLng, rateLimited } from "@/lib/gebeta-api";

export const dynamic = "force-dynamic";

const REQUESTS_PER_MINUTE = 60;
/** One-to-many: up to 5 destinations, like the ONM API. */
const MAX_DESTINATIONS = 5;

/** ?origin=lat,lng&destination=lat,lng (repeat destination for several routes from one origin). */
export async function GET(req: NextRequest) {
    const origin = parseLatLng(req.nextUrl.searchParams.get("origin"));
    const destinations = req.nextUrl.searchParams.getAll("destination").slice(0, MAX_DESTINATIONS).map(parseLatLng);
    if (!origin || !destinations.length || destinations.some((d) => !d)) {
        return NextResponse.json({ error: "origin and destination are required as lat,lng" }, { status: 422 });
    }
    if (rateLimited(`directions:${clientIp(req)}`, REQUESTS_PER_MINUTE)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    try {
        const routes = await Promise.all(destinations.map((d) => directions(origin, d!)));
        return NextResponse.json({ routes });
    } catch (err) {
        console.error("[map directions]", err);
        return NextResponse.json({ error: "Directions failed" }, { status: 502 });
    }
}
