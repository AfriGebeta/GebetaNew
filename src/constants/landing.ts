/**
 * Content for the marketing landing page. Components read copy, numbers and coordinates from here
 * so nothing on the page is hard-coded in markup.
 */

import placesJson from "./demo-places.json";
import demoSpec from "./demo-spec.json";

export type LngLat = [lng: number, lat: number];

export type Place = {
    id: string;
    name: string;
    /** Shorter name for tight spots such as map labels. */
    short?: string;
    /** The query the demo types (names the live geocoder resolves). */
    query: string;
    area: string;
    /** From the geocoding API, resolved by scripts/generate-demo-routes.mjs. */
    lngLat: LngLat;
    /** Which geocoding result the coordinates come from. */
    geocode?: { query: string; match: string; type?: string };
};

/** Published latency targets per API, in milliseconds. */
export const LATENCY = {
    geocoding: 20,
    routing: 400,
    budget: 400,
} as const;

export const SERVICES = [
    { id: "geocoding", name: "Geocoding", latencyMs: LATENCY.geocoding, bound: "≈" },
    { id: "directions", name: "Directions", latencyMs: LATENCY.routing, bound: "<" },
    { id: "matrix", name: "Matrix", latencyMs: LATENCY.routing, bound: "<" },
    { id: "optimization", name: "Route optimization", latencyMs: LATENCY.routing, bound: "<" },
    { id: "onm", name: "One-to-many", latencyMs: LATENCY.routing, bound: "<" },
] as const;

export const ADDIS_CENTER: LngLat = [38.7613, 9.0105];

/** Real Addis Ababa landmarks, shared with scripts/generate-demo-routes.mjs. Coordinates are approximate to the building. */
export const PLACES = placesJson as unknown as Place[];

/** Average city driving speed used to estimate durations on the drawn fallback map. */
export const FALLBACK_SPEED_KMH = 24;

/** Where routes in the demos start. */
export const ORIGIN_ID = demoSpec.origin;


/** Context streets for the drawn map (approximate traces of the Ring Road and main avenues). */
export const FALLBACK_STREETS: LngLat[][] = [
    // Ring Road
    [[38.802, 9.0205], [38.795, 9.004], [38.789, 8.9958], [38.772, 8.988], [38.757, 8.985], [38.738, 8.9875], [38.72, 8.995], [38.716, 9.013], [38.722, 9.035], [38.732, 9.052], [38.755, 9.06], [38.78, 9.055], [38.797, 9.04], [38.802, 9.0205]],
    // Haile Gebreselassie Road to Megenagna
    [[38.7613, 9.0105], [38.775, 9.0125], [38.785, 9.016], [38.795, 9.019], [38.802, 9.0205]],
    // Churchill Avenue
    [[38.7505, 9.0352], [38.7495, 9.025], [38.748, 9.015], [38.747, 9.01]],
    // Debre Zeit Road
    [[38.7613, 9.0105], [38.764, 9.0], [38.765, 8.985]],
    // Mexico to Tor Hailoch
    [[38.745, 9.01], [38.733, 9.0115], [38.716, 9.013]],
    // Entoto Avenue
    [[38.762, 9.043], [38.76, 9.06]],
];

export const HERO = {
    title: "Location Solutions, Simplified.",
    description: "Advanced location technology for businesses, developers, and logistics providers.",
    primary: { label: "Start building free", href: "/auth/register" },
    signedIn: { label: "Go to dashboard", href: "/dashboard" },
    secondary: { label: "Talk to sales", href: "/contact" },
} as const;

/** What the geocoding product demo searches on its own, until the visitor types. */
export const GEOCODING_DEMO = {
    autoplay: ["Edna Mall", "Unity Park", "Sheraton Addis", "Shiro Meda", "Kotebe Health Center"],
    placeholder: "Search a place, e.g. Unity Park",
    empty: "Pick a result to see it on the map",
    maxResults: 6,
};

export const MAP_STYLES = [
    { id: "standard", label: "Standard", url: "https://tiles.gebeta.app/styles/standard/style.json" },
    { id: "satellite", label: "Satellite", url: "https://tiles.gebeta.app/styles/raster/raster.json" },
    { id: "terrain", label: "Terrain", url: "https://tiles.gebeta.app/styles/standard/terrain/terrain.json" },
] as const;

export const BENTO = {
    title: "One key, every location API",
    description: "Everything below runs on the same tiles, the same address data and the same account.",
    tiles: {
        tiles: {
            title: "Vector tiles, down to the alley",
            body: "Standard, satellite and terrain styles from our own tile servers, rendered by MapLibre on web and mobile.",
            href: "https://docs.gebeta.app/",
        },
        geocoding: {
            title: "Find any place by name",
            body: `Landmarks, businesses and neighbourhoods resolve to a coordinate in about ${LATENCY.geocoding} ms.`,
            href: "https://docs.gebeta.app/docs/geocoding/geocoding",
        },
        directions: {
            title: "Turn-by-turn in one request",
            body: `Driving routes with distance, duration and every manoeuvre, returned in under ${LATENCY.routing} ms.`,
            href: "https://docs.gebeta.app/docs/direction",
        },
        matrix: {
            title: "Every origin to every stop",
            body: "Travel times between many points at once, for dispatch, pricing and ETAs.",
            href: "https://docs.gebeta.app/docs/matrix",
        },
        optimization: {
            title: "Ten stops, one best order",
            body: "Route optimization puts a day of deliveries in the order that drives the fewest kilometres.",
            href: "https://docs.gebeta.app/docs/route-optimization",
        },
        sdk: {
            title: "Three lines to a map",
            body: "SDKs for JavaScript, React, React Native and Node, with auth handled for you.",
            href: "https://afrigebeta.github.io/Gebeta-SDK-JS/",
        },
    },
} as const;


/** Matrix demo: place ids for rows and columns, with short labels for the table. */
export const MATRIX = {
    origins: demoSpec.matrixOrigins,
    destinations: demoSpec.matrixDestinations,
    labels: { meskel: "Meskel Sq", piassa: "Piassa", merkato: "Merkato", edna: "Edna Mall", airport: "Airport", aau: "AAU" } as Record<string, string>,
    /** The cell selected until the visitor picks one: [origin row, destination column]. */
    initial: [1, 1] as [number, number],
    metrics: [
        { value: "time", label: "Time" },
        { value: "distance", label: "Distance" },
    ],
    from: "From",
    to: "To",
    hint: "Hover or tap a cell",
    /** "3 origins × 3 destinations = 9 routes · 1 request": why a matrix beats one Directions call per pair. */
    summary: (origins: number, destinations: number) =>
        `${origins} origins × ${destinations} destinations = ${origins * destinations} routes · 1 request`,
} as const;

/** Route optimization demo: the depot is ORIGIN_ID, these are the stops in the order they were entered. */
export const OPTIMIZATION_STOPS = demoSpec.optimizationStops;

/** Labels for the route optimization demo's comparison strip. */
export const OPTIMIZATION_COPY = {
    entered: "As entered",
    best: "Optimized",
    saved: (minutes: number) => `−${minutes} min`,
};

/** One-to-many demo destinations (the ONM API takes up to five). */
export const ONM_DESTINATIONS = demoSpec.onmDestinations;

/** Destinations the directions demos cycle through, from ORIGIN_ID. */
export const ROUTE_CYCLE = demoSpec.routeCycle;
export const DIRECTIONS_TILE_TARGET = demoSpec.directionsTile;

export const SDK_SNIPPETS = [
    {
        id: "js",
        label: "JavaScript",
        code: `import { GebetaMaps } from "@gebeta/js";

const gebeta = new GebetaMaps({ auth });
const map = gebeta.init({ container: "#map", center: [38.76, 9.01], zoom: 13 });`,
    },
    {
        id: "route",
        label: "Directions",
        code: `const route = await gebeta.getDirections(
  { lng: 38.7613, lat: 9.0105 }, // Meskel Square
  { lng: 38.789, lat: 8.9958 },  // Edna Mall
);
gebeta.displayRoute(route);`,
    },
    {
        id: "node",
        label: "Node",
        code: `import { GebetaAuth } from "@gebeta/node";

const auth = new GebetaAuth({ serverToken });
const { accessToken } = await auth.authenticate(clientToken);`,
    },
] as const;

export const PERFORMANCE = {
    title: "Fast enough to feel local",
    description:
        `A geocode comes back faster than a blink. Directions, matrix and optimization answer in under ${LATENCY.routing} ms.`,
    headline: { value: LATENCY.geocoding, unit: "ms", label: "typical geocoding response" },
    comparison: [
        { label: "Gebeta geocoding", ms: LATENCY.geocoding, tone: "primary" },
        { label: "A blink of an eye", ms: 150, tone: "muted" },
        { label: "Gebeta routing, upper bound", ms: LATENCY.routing, tone: "foreground" },
    ],
    scaleMaxMs: 500,
    footnote: "Typical server response times. Your network adds its own.",
} as const;

export const CTA = {
    title: "Put your product on the map",
    description: "Create a free account, get a key and make your first request today.",
    primary: { label: "Create free account", href: "/auth/register" },
    secondary: { label: "Read the docs", href: "https://docs.gebeta.app/" },
} as const;
