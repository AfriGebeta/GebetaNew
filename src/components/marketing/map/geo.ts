import type { LngLat } from "@/constants/landing";

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function distance([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
    const R = 6_371_000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export function pathLength(coords: LngLat[]) {
    let total = 0;
    for (let i = 1; i < coords.length; i++) total += distance(coords[i - 1], coords[i]);
    return total;
}

/** Compass bearing from a to b, in degrees. */
export function bearing([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) {
    const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (Math.atan2(y, x) * 180) / Math.PI;
}

/** The leading part of a route at `t` (0–1) of its length, plus the head position and heading. */
export function sliceRoute(coords: LngLat[], t: number) {
    if (coords.length < 2) return { line: coords, head: coords[0], heading: 0 };
    const target = pathLength(coords) * Math.min(1, Math.max(0, t));
    const line: LngLat[] = [coords[0]];
    let walked = 0;
    for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];
        const seg = distance(a, b);
        if (walked + seg >= target) {
            const f = seg === 0 ? 0 : (target - walked) / seg;
            const head: LngLat = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
            line.push(head);
            return { line, head, heading: bearing(a, b) };
        }
        walked += seg;
        line.push(b);
    }
    const last = coords[coords.length - 1];
    return { line, head: last, heading: bearing(coords[coords.length - 2], last) };
}

export type Bounds = { west: number; east: number; south: number; north: number };

export function boundsOf(points: LngLat[], padding = 0.1): Bounds {
    const lngs = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const padLng = (east - west) * padding;
    const padLat = (north - south) * padding;
    return { west: west - padLng, east: east + padLng, south: south - padLat, north: north + padLat };
}

/** Equirectangular projection into an SVG viewBox; accurate enough across one city. */
export function projector(bounds: Bounds, width: number, height: number) {
    return ([lng, lat]: LngLat): [number, number] => [
        ((lng - bounds.west) / (bounds.east - bounds.west)) * width,
        ((bounds.north - lat) / (bounds.north - bounds.south)) * height,
    ];
}

export function formatDistance(metres: number) {
    return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.round(metres)} m`;
}

export function formatDuration(seconds: number) {
    return `${Math.max(1, Math.round(seconds / 60))} min`;
}
