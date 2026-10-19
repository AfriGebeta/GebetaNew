import { demoRoute } from "@/constants/demo-routes";
import {
    FALLBACK_SPEED_KMH,
    LATENCY,
    PLACES,
    type LngLat,
    type Place,
} from "@/constants/landing";
import { pathLength } from "./geo";

export const TILE_HOST = "https://tiles.gebeta.app/";
export const proxiedTileUrl = (url: string) =>
    url.startsWith(TILE_HOST) ? `${window.location.origin}/api/map/tiles/${url.slice(TILE_HOST.length).split("?")[0]}` : url;

/** Latency shown in the demos is the published figure, not the visitor's round trip. */
export type Timed<T> = T & { ms: number };

export type RouteResult = { coords: LngLat[]; distanceM: number; durationS: number };

const latLng = ([lng, lat]: LngLat) => `${lat},${lng}`;

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function matchPlaces(query: string): Place[] {
    const words = normalise(query).split(" ").filter((w) => w.length > 1);
    if (!words.length) return [];
    return PLACES.map((place) => {
        const hay = normalise(`${place.query} ${place.name} ${place.area}`);
        return { place, score: words.filter((w) => hay.includes(w)).length };
    })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.place);
}

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export async function geocode(query: string): Promise<Timed<{ hits: Place[]; live: boolean }>> {
    try {
        const res = await fetch(`/api/map/geocode?name=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(String(res.status));
        const { results } = (await res.json()) as {
            results: { name: string; city: string; type: string; lngLat: LngLat }[];
        };
        const hits = results.map((r, i) => ({
            id: `live-${i}-${r.lngLat.join(",")}`,
            name: titleCase(r.name),
            query,
            area: [r.type && titleCase(r.type), r.city].filter(Boolean).join(" · "),
            lngLat: r.lngLat,
        }));
        if (hits.length) return { hits, live: true, ms: LATENCY.geocoding };
    } catch {
    }
    return { hits: matchPlaces(query), live: false, ms: LATENCY.geocoding };
}

function fallbackRoute(from: LngLat, to: LngLat): RouteResult {
    const coords = [from, to];
    const distanceM = pathLength(coords);
    return { coords, distanceM, durationS: (distanceM / 1000 / FALLBACK_SPEED_KMH) * 3600 };
}

export async function routes(from: Place, to: Place[]): Promise<Timed<{ routes: RouteResult[]; live: boolean }>> {
    const saved = to.map((p) => demoRoute(from.id, p.id));
    if (saved.every(Boolean)) return { routes: saved as RouteResult[], live: true, ms: LATENCY.routing };
    try {
        const query = new URLSearchParams({ origin: latLng(from.lngLat) });
        to.forEach((p) => query.append("destination", latLng(p.lngLat)));
        const res = await fetch(`/api/map/directions?${query}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { routes: (RouteResult | null)[] };
        const list = data.routes.map((r, i) => saved[i] ?? (r && r.coords.length > 1 ? r : fallbackRoute(from.lngLat, to[i].lngLat)));
        return { routes: list, live: data.routes.some(Boolean), ms: LATENCY.routing };
    } catch {
        return { routes: to.map((p, i) => saved[i] ?? fallbackRoute(from.lngLat, p.lngLat)), live: false, ms: LATENCY.routing };
    }
}

export async function route(from: Place, to: Place): Promise<Timed<RouteResult & { live: boolean }>> {
    const result = await routes(from, [to]);
    return { ...result.routes[0], live: result.live, ms: result.ms };
}
