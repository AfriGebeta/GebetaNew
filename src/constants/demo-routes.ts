import data from "./demo-routes.json";
import type { LngLat } from "./landing";

/**
 * Routes, travel times and the optimized tour the marketing demos animate. Generated once from the live
 * Gebeta APIs by `node scripts/generate-demo-routes.mjs`, so the page draws real road geometry without
 * calling the API on every view, and the moving marker follows exactly the line that is drawn.
 */

export type Maneuver = { type: number; text: string; at: number; distanceM: number };
export type DemoRoute = { coords: LngLat[]; distanceM: number; durationS: number; maneuvers: Maneuver[] };

const routes = data.routes as unknown as Record<string, DemoRoute>;

export const demoRoute = (from: string, to: string): DemoRoute | null => routes[`${from}>${to}`] ?? null;

/** Every saved route, e.g. to draw the street context of the offline map. */
export const ALL_DEMO_ROUTES = Object.values(routes);

/** Travel minutes and road kilometres between every pair of demo places. */
export const DEMO_MATRIX = data.matrix as { ids: string[]; minutes: number[][]; km: number[][] };

export const demoMinutes = (from: string, to: string) =>
    DEMO_MATRIX.minutes[DEMO_MATRIX.ids.indexOf(from)]?.[DEMO_MATRIX.ids.indexOf(to)] ?? 0;

export const demoKm = (from: string, to: string) =>
    DEMO_MATRIX.km[DEMO_MATRIX.ids.indexOf(from)]?.[DEMO_MATRIX.ids.indexOf(to)] ?? 0;

/**
 * The depot-and-stops tour, each as one API answer: Directions with the stops as waypoints in the order
 * they were entered, and the route optimization (TSS) API's best order, polyline, time and distance.
 */
export const DEMO_OPTIMIZATION = data.optimization as {
    entered: string[];
    best: string[];
    enteredLine: LngLat[];
    bestLine: LngLat[];
    enteredMinutes: number;
    enteredKm: number;
    bestMinutes: number;
    bestKm: number;
};

/** One-to-many (ONM API) travel times from the demo origin to each destination. */
export const DEMO_ONM = data.onm as Record<string, { minutes: number; km: number }>;

export type ManeuverKind = "straight" | "right" | "left" | "uturn" | "roundabout" | "arrive";

/** Valhalla maneuver types, grouped by the arrow a driver would see. */
export function maneuverKind(type: number): ManeuverKind {
    if (type >= 4 && type <= 6) return "arrive";
    if ([9, 10, 11, 18, 20, 23].includes(type)) return "right";
    if ([14, 15, 16, 19, 21, 24].includes(type)) return "left";
    if (type === 12 || type === 13) return "uturn";
    if (type === 26 || type === 27) return "roundabout";
    return "straight";
}
