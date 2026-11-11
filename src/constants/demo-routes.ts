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

export const ALL_DEMO_ROUTES = Object.values(routes);

export const DEMO_MATRIX = data.matrix as { ids: string[]; minutes: number[][]; km: number[][] };

export const demoMinutes = (from: string, to: string) =>
    DEMO_MATRIX.minutes[DEMO_MATRIX.ids.indexOf(from)]?.[DEMO_MATRIX.ids.indexOf(to)] ?? 0;

export const demoKm = (from: string, to: string) =>
    DEMO_MATRIX.km[DEMO_MATRIX.ids.indexOf(from)]?.[DEMO_MATRIX.ids.indexOf(to)] ?? 0;

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
