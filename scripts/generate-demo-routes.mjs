#!/usr/bin/env node
/**
 * Geocodes the demo places, then fetches the routes the marketing demos animate, once, and saves them to src/constants/demo-routes.json.
 * The page then draws from that file: no API call on page view, and the moving marker follows exactly the
 * polyline that is drawn.
 *
 *   node scripts/generate-demo-routes.mjs        (reads GEBETA_TOKEN from the environment or .env)
 *
 * Re-run it whenever demo-places.json or demo-spec.json change.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const constants = join(root, "src/constants");
const placesFile = join(constants, "demo-places.json");
const places = JSON.parse(readFileSync(placesFile, "utf8"));
const spec = JSON.parse(readFileSync(join(constants, "demo-spec.json"), "utf8"));

const API = "https://mapapi.gebeta.app";
const SIMPLIFY_M = 2;
const DECIMALS = 6;
const CONCURRENCY = 2;
const RETRIES = 4;
const BACKOFF_MS = 1500;
const GEOCODE_ATTEMPTS = 6;

function readKey() {
    if (process.env.GEBETA_TOKEN) return process.env.GEBETA_TOKEN.trim();
    const env = readFileSync(join(root, ".env"), "utf8");
    const line = env.split("\n").find((l) => l.startsWith("GEBETA_TOKEN="));
    if (!line) throw new Error("GEBETA_TOKEN is not set (environment or .env)");
    return line.slice("GEBETA_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
}
const KEY = readKey();
const latLng = (id) => `${byId[id].lngLat[1]},${byId[id].lngLat[0]}`;

/** Decodes a Valhalla polyline (precision 6) into [lng, lat] pairs. */
function decode(str, precision = 6) {
    const factor = 10 ** precision;
    const out = [];
    let index = 0, lat = 0, lng = 0;
    while (index < str.length) {
        for (const axis of [0, 1]) {
            let shift = 0, result = 0, byte;
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const delta = result & 1 ? ~(result >> 1) : result >> 1;
            if (axis === 0) lat += delta;
            else lng += delta;
        }
        out.push([lng / factor, lat / factor]);
    }
    return out;
}

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
function metres(a, b) {
    const dLat = rad(b[1] - a[1]);
    const dLng = rad(b[0] - a[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

function offset(p, a, b) {
    const k = Math.cos(rad(a[1]));
    const [px, py] = [(p[0] - a[0]) * k, p[1] - a[1]];
    const [bx, by] = [(b[0] - a[0]) * k, b[1] - a[1]];
    const len = bx * bx + by * by;
    const t = len ? Math.max(0, Math.min(1, (px * bx + py * by) / len)) : 0;
    return Math.hypot(px - t * bx, py - t * by) * (Math.PI / 180) * R;
}

/** Douglas–Peucker that never drops a vertex listed in `keep` (maneuver points). */
function simplify(points, tolerance, keep) {
    const marked = new Uint8Array(points.length);
    marked[0] = marked[points.length - 1] = 1;
    keep.forEach((i) => (marked[i] = 1));
    const stack = [[0, points.length - 1]];
    while (stack.length) {
        const [first, last] = stack.pop();
        let max = 0, index = 0;
        for (let i = first + 1; i < last; i++) {
            const d = marked[i] ? Infinity : offset(points[i], points[first], points[last]);
            if (d > max) [max, index] = [d, i];
        }
        if (max > tolerance) {
            marked[index] = 1;
            stack.push([first, index], [index, last]);
        }
    }
    return points.map((p, i) => (marked[i] ? i : -1)).filter((i) => i >= 0);
}

const round = (n) => Number(n.toFixed(DECIMALS));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, params) {
    const query = new URLSearchParams({ ...params, apiKey: KEY });
    for (let attempt = 1; ; attempt++) {
        const res = await fetch(`${API}${path}?${query}`);
        if (res.ok) return res.json();
        // The routing backend answers 502/503 under load; back off and retry.
        if (attempt >= RETRIES || res.status < 500) throw new Error(`${path} → ${res.status}`);
        await sleep(BACKOFF_MS * attempt);
    }
}

async function direction(fromId, toId) {
    const data = await get("/api/route/direction/", {
        origin: latLng(fromId),
        destination: latLng(toId),
        instruction: "1",
        format: "valhalla",
    });
    const leg = data?.trip?.legs?.[0];
    if (!leg) throw new Error(`no route ${fromId} → ${toId}`);

    const full = decode(leg.shape);
    const keepIdx = leg.maneuvers.map((m) => m.begin_shape_index);
    const kept = simplify(full, SIMPLIFY_M, keepIdx);
    const coords = kept.map((i) => full[i].map(round));

    // Maneuvers are placed by distance fraction along the route, so they stay correct after simplification.
    const cumulative = [0];
    for (let i = 1; i < full.length; i++) cumulative.push(cumulative[i - 1] + metres(full[i - 1], full[i]));
    const total = cumulative[cumulative.length - 1] || 1;

    return {
        coords,
        distanceM: Math.round(leg.summary.length * 1000),
        durationS: Math.round(leg.summary.time),
        maneuvers: leg.maneuvers.map((m) => ({
            type: m.type,
            text: m.instruction,
            at: Number((cumulative[m.begin_shape_index] / total).toFixed(4)),
            distanceM: Math.round((m.length ?? 0) * 1000),
        })),
    };
}

async function matrix(ids) {
    const json = `[${ids.map((id) => `{${latLng(id)}}`).join(",")}]`;
    const data = await get("/api/route/matrix", { json });
    // Like ONM, the matrix answers 0 min / 0 km for a point it cannot route from or to (e.g. Itegue Taitu Hotel).
    const bad = data.origin_to_destination.filter((c) => c.from !== c.to && !c.distance);
    if (bad.length) {
        const names = [...new Set(bad.flatMap((c) => [ids[c.from], ids[c.to]]))].join(", ");
        throw new Error(`matrix returned 0 km between ${names}; pin the unroutable place elsewhere`);
    }
    const n = ids.length;
    const minutes = Array.from({ length: n }, () => Array(n).fill(0));
    const km = Array.from({ length: n }, () => Array(n).fill(0));
    for (const c of data.origin_to_destination) {
        minutes[c.from][c.to] = Math.round(c.time / 60);
        km[c.from][c.to] = Number(c.distance.toFixed(2));
    }
    return { ids, minutes, km };
}

const points = (ids) => `[${ids.map((id) => `{${latLng(id)}}`).join(",")}]`;

/**
 * Route optimization (TSS): the best order to visit the stops from the depot, its road polyline,
 * time and distance. Note the endpoint has no trailing slash; `/tss/` answers 502.
 */
async function tss(ids) {
    const data = await get("/api/route/tss", { json: points(ids) });
    if (data?.msg !== "Ok") throw new Error(`tss: ${JSON.stringify(data).slice(0, 200)}`);
    // best_order lists the depot, each stop with its original_index, and the depot again.
    // The closing entry (back at the depot) carries an index past the input list.
    const order = data.best_order.map((p) => ids[p.original_index ?? 0] ?? ids[0]);
    const full = data.Direction.map(([lat, lng]) => [lng, lat]);
    const line = simplify(full, SIMPLIFY_M, []).map((i) => full[i].map(round));
    return {
        order,
        line,
        minutes: Math.round(data.time_taken / 60),
        km: Number(data.total_distance.toFixed(1)),
    };
}

async function directionTour(ids) {
    const [start, ...rest] = ids;
    const end = rest.pop();
    const data = await get("/api/route/direction/", {
        origin: latLng(start),
        destination: latLng(end),
        waypoints: points(rest),
    });
    if (data?.msg !== "Ok") throw new Error(`direction tour: ${JSON.stringify(data).slice(0, 200)}`);
    const full = data.direction.map(([lat, lng]) => [lng, lat]);
    return {
        line: simplify(full, SIMPLIFY_M, []).map((i) => full[i].map(round)),
        // `timetaken` is the tour's travel time in seconds; `totalDistance` is metres.
        minutes: Math.round(data.timetaken / 60),
        km: Number((data.totalDistance / 1000).toFixed(1)),
    };
}

/** One-to-many (ONM): travel time and distance from one origin to each destination. No trailing slash. */
async function onm(originId, ids) {
    const data = await get("/api/route/onm", { origin: latLng(originId), json: points(ids) });
    if (!Array.isArray(data?.origin_to_destination)) throw new Error(`onm: ${JSON.stringify(data).slice(0, 200)}`);
    // ONM answers 0 km / 0 s for some points it fails to snap to a road (e.g. Itegue Taitu Hotel);
    // never save that as a real travel time.
    const bad = data.origin_to_destination.filter((c) => ids[c.to] !== originId && c.distance === 0);
    if (bad.length) throw new Error(`onm returned 0 km for ${bad.map((c) => ids[c.to]).join(", ")}; pick other destinations`);
    return Object.fromEntries(
        data.origin_to_destination.map((c) => [ids[c.to], { minutes: Math.round(c.time / 60), km: Number(c.distance.toFixed(2)) }]),
    );
}

async function pool(tasks, size) {
    const results = [];
    let next = 0;
    await Promise.all(
        Array.from({ length: size }, async () => {
            while (next < tasks.length) {
                const i = next++;
                results[i] = await tasks[i]();
            }
        }),
    );
    return results;
}

/**
 * Every place's coordinates come from the geocoding API: each one names the query and the exact result
 * to take (plus its type where a name repeats). A missing match stops the run instead of guessing.
 */
async function resolvePlaces() {
    for (const place of places) {
        const { query, match, type } = place.geocode;
        // The geocoder returns a varying subset of matches per call, so ask a few times.
        let hit;
        for (let attempt = 0; attempt < GEOCODE_ATTEMPTS && !hit; attempt++) {
            const data = await get("/api/v1/route/geocoding", { name: query });
            hit = (data?.data ?? []).find(
                (r) => r.name.trim().toLowerCase() === match.trim().toLowerCase() && (!type || r.type === type),
            );
        }
        if (!hit) throw new Error(`geocoding "${query}" has no result named "${match}"${type ? ` (${type})` : ""}`);
        place.lngLat = [hit.longitude, hit.latitude];
        process.stdout.write(`  ${place.id}: ${hit.name} (${hit.latitude}, ${hit.longitude})\n`);
    }
    writeFileSync(placesFile, JSON.stringify(places, null, 2) + "\n");
}

await resolvePlaces();
const byId = Object.fromEntries(places.map((p) => [p.id, p]));

const origin = spec.origin;

const entered = [origin, ...spec.optimizationStops, origin];
const [solved, asEntered] = await Promise.all([tss([origin, ...spec.optimizationStops]), directionTour(entered)]);

const onmTimes = await onm(origin, spec.onmDestinations);

// Matrix demo: every pair among its origins and destinations (the API allows up to 10 points).
const placesMatrix = await matrix([...new Set([...spec.matrixOrigins, ...spec.matrixDestinations])]);

const pairs = new Set();
[...spec.heroAutoplay, ...spec.routeCycle, spec.directionsTile, ...spec.onmDestinations].forEach((id) => pairs.add(`${origin}>${id}`));

const keys = [...pairs];
const results = await pool(
    keys.map((key) => () => {
        const [from, to] = key.split(">");
        process.stdout.write(`  ${key}\n`);
        return direction(from, to);
    }),
    CONCURRENCY,
);
const routes = Object.fromEntries(keys.map((k, i) => [k, results[i]]));

const optimization = {
    entered,
    best: solved.order,
    enteredLine: asEntered.line,
    bestLine: solved.line,
    enteredMinutes: asEntered.minutes,
    enteredKm: asEntered.km,
    bestMinutes: solved.minutes,
    bestKm: solved.km,
};

const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    routes,
    matrix: placesMatrix,
    optimization,
    onm: onmTimes,
};
writeFileSync(join(constants, "demo-routes.json"), JSON.stringify(out));
const pointCount = Object.values(routes).reduce((n, r) => n + r.coords.length, 0);
console.log(`Saved ${keys.length} routes (${pointCount} points), a ${placesMatrix.ids.length}×${placesMatrix.ids.length} matrix, the TSS tour and ONM times.`);
console.log(`Tour: ${optimization.enteredMinutes} min / ${optimization.enteredKm} km as entered → ${optimization.bestMinutes} min / ${optimization.bestKm} km from TSS.`);
console.log(`TSS order: ${solved.order.join(" → ")}`);
