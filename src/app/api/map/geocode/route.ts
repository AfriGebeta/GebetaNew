import { NextRequest, NextResponse } from "next/server";
import { clientIp, geocode, rateLimited } from "@/lib/gebeta-api";

export const dynamic = "force-dynamic";

const MAX_QUERY = 120;
const MAX_RESULTS = 6;
const REQUESTS_PER_MINUTE = 60;

export async function GET(req: NextRequest) {
    const name = req.nextUrl.searchParams.get("name")?.trim().slice(0, MAX_QUERY);
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 422 });
    if (rateLimited(`geocode:${clientIp(req)}`, REQUESTS_PER_MINUTE)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    try {
        const results = await geocode(name);
        return NextResponse.json({ results: results.slice(0, MAX_RESULTS) });
    } catch (err) {
        console.error("[map geocode]", err);
        return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
    }
}
