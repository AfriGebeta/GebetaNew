import "server-only";

/**
 * Server-side access to the Gebeta APIs for the marketing demos. The key (GEBETA_TOKEN) never reaches the
 * browser: tiles, geocoding, directions and matrix are proxied through /api/map/*.
 */

export const TILES_ORIGIN = "https://tiles.gebeta.app";
const API_ORIGIN = "https://mapapi.gebeta.app";

export type LngLat = [number, number];

export function gebetaKey() {
    return process.env.GEBETA_TOKEN?.trim() || null;
}

/* ─── Rate limiting: a small per-IP window so the proxy can't be used as a free relay ─────────────── */

const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; start: number }>();

export function rateLimited(ip: string, limit: number) {
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
        hits.set(ip, { count: 1, start: now });
        if (hits.size > 10_000) hits.clear();
        return false;
    }
    entry.count += 1;
    return entry.count > limit;
}

export function clientIp(req: Request) {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function parseLatLng(value: string | null): LngLat | null {
    if (!value) return null;
    const [lat, lng] = value.split(",").map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return [lng, lat];
}

async function call(path: string, params: Record<string, string>) {
    const key = gebetaKey();
    if (!key) throw new Error("GEBETA_TOKEN is not set");
    const query = new URLSearchParams({ ...params, apiKey: key });
    const res = await fetch(`${API_ORIGIN}${path}?${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Gebeta ${path} responded ${res.status}`);
    return res.json();
}

export type GeocodeResult = { name: string; city: string; type: string; lngLat: LngLat };

export async function geocode(name: string): Promise<GeocodeResult[]> {
    const data = await call("/api/v1/route/geocoding", { name });
    if (data?.msg !== "Ok" || !Array.isArray(data.data)) return [];
    return data.data.map((r: { name: string; City?: string; type?: string; latitude: number; longitude: number }) => ({
        name: r.name,
        city: r.City ?? "",
        type: r.type ?? "",
        lngLat: [r.longitude, r.latitude] as LngLat,
    }));
}

export type DirectionsResult = { coords: LngLat[]; distanceM: number; durationS: number };

export async function directions(origin: LngLat, destination: LngLat): Promise<DirectionsResult | null> {
    const data = await call("/api/route/direction/", {
        origin: `${origin[1]},${origin[0]}`,
        destination: `${destination[1]},${destination[0]}`,
    });
    if (data?.msg !== "Ok" || !Array.isArray(data.direction)) return null;
    return {
        coords: data.direction.map(([lat, lng]: [number, number]) => [lng, lat] as LngLat),
        distanceM: Number(data.totalDistance) || 0,
        // `timetaken` is the route's travel time in seconds.
        durationS: Number(data.timetaken) || 0,
    };
}
