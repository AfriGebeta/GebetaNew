import { LATENCY } from "@/constants/landing";
import { DEMO_OPTIMIZATION } from "@/constants/demo-routes";

/**
 * Product catalogue for the marketing site: the navigation menu, the bento, the footer and the
 * /products/[slug] pages all read from here.
 */

export type ProductDemo = "tiles" | "geocoding" | "directions" | "matrix" | "optimization" | "onm";

export type Product = {
    slug: string;
    demo: ProductDemo;
    name: string;
    /** One line for menus and cards. */
    summary: string;
    /** Page headline: two lines at most. */
    title: string;
    description: string;
    latency: { bound: "≈" | "<"; ms: number };
    docs: string;
    limits: string[];
    features: { title: string; body: string }[];
    useCases: { title: string; body: string }[];
    /** A short explainer shown on the product page; the API reference lives in the docs. */
    article: { title: string; paragraphs: string[] };
};

const COMMON_LIMITS = ["50 requests per second per key", "No inter-country or inter-region requests"];

export const PRODUCTS: Product[] = [
    {
        slug: "maps",
        demo: "tiles",
        name: "Map tiles",
        summary: "Vector, satellite and terrain maps for web and mobile",
        title: "Maps drawn from local data",
        description:
            "Vector tiles with roads, buildings, landuse and points of interest, plus satellite and terrain styles. Rendered with MapLibre on the web and in React Native.",
        latency: { bound: "<", ms: LATENCY.routing },
        docs: "https://docs.gebeta.app/docs/tiles/overview",
        limits: ["Daily tile allowance depends on your plan"],
        features: [
            { title: "Three styles, one key", body: "Standard vector, satellite imagery and 3D terrain, switchable at runtime." },
            { title: "Separate data layers", body: "Roads, buildings, water, landuse and points of interest ship as their own sources, so you can restyle any of them." },
            { title: "Vector all the way", body: "Crisp at every zoom and pitch, with labels that rotate with the map." },
            { title: "Your stack", body: "Drop-in SDKs for JavaScript, React and React Native, or point any MapLibre client at the style URL." },
        ],
        useCases: [
            { title: "Store and branch locators", body: "Show every location with your own markers and colours." },
            { title: "Live fleet views", body: "Put drivers and deliveries on a map your dispatch team can read at a glance." },
            { title: "Property and land", body: "Switch to satellite to see the plot, then back to streets to find it." },
        ],
        article: {
            title: "How Gebeta map tiles work",
            paragraphs: [
                "A Gebeta map is drawn in the browser from vector tiles: small packets of roads, buildings, water, land use and points of interest for each square of the world at each zoom level. Because the data arrives as geometry rather than pictures, the map stays sharp at any zoom, labels turn with the map, and you can restyle any layer without asking us for new images.",
                "Three styles share the same tiles. Standard is the everyday street map, satellite lays imagery under the road and place layers, and terrain adds hillshading and elevation for the city's slopes. Switching between them is a single call, and the data underneath stays the same.",
                "You can start with the JavaScript SDK, which sets up MapLibre and authentication for you, or point any MapLibre-compatible client at the style URL. Usage is counted in tiles per day, and your plan sets the allowance.",
            ],
        },
    },
    {
        slug: "geocoding",
        demo: "geocoding",
        name: "Geocoding",
        summary: "Turn place names into coordinates, and back",
        title: "Find any place by name",
        description:
            "Search landmarks, businesses and neighbourhoods and get coordinates back, or reverse a coordinate into a place. Built on local data, so the places your customers name are on the map.",
        latency: { bound: "≈", ms: LATENCY.geocoding },
        docs: "https://docs.gebeta.app/docs/geocoding/geocoding",
        limits: COMMON_LIMITS,
        features: [
            { title: "Local places first", body: "Malls, hotels, offices, squares and neighbourhoods, named the way they're signposted." },
            { title: "Ranked results", body: "Several candidates per query, each with its type and city, so users can pick the right one." },
            { title: "Reverse geocoding", body: "Turn a GPS fix into the nearest named place for receipts, pickups and logs." },
            { title: `About ${LATENCY.geocoding} ms`, body: "Fast enough to run on every keystroke of a search box." },
        ],
        useCases: [
            { title: "Address search", body: "Autocomplete pickup and drop-off points in ride-hailing and delivery apps." },
            { title: "Clean up records", body: "Attach coordinates to customer and branch addresses already in your database." },
            { title: "Check-ins", body: "Name where a field agent is from the phone's location." },
        ],
        article: {
            title: "How geocoding works",
            paragraphs: [
                "Geocoding turns the name of a place into coordinates you can put on a map or route to. Ask for Edna Mall and you get back a short list of matches, each with its coordinates, its type (a mall, a hotel, an office) and its city, ranked so the most likely answer comes first.",
                "The search index is built from local data: businesses, landmarks, squares and neighbourhoods as they are named on signs and in everyday use. That matters where many addresses are described by the nearest landmark rather than a street number. Reverse geocoding works the other way, turning a GPS position into the nearest named place.",
                "Responses are small and fast, typically around 20 ms on our side, so you can search as the user types. Show the top few results and let the user confirm, then keep the coordinates rather than the text, so later routing is exact.",
            ],
        },
    },
    {
        slug: "directions",
        demo: "directions",
        name: "Directions",
        summary: "Turn-by-turn routes with distance and duration",
        title: "Routes that follow real roads",
        description:
            "Driving routes between any two points, with the full geometry, distance and travel time, ready to draw on the map or feed into your ETA.",
        latency: { bound: "<", ms: LATENCY.routing },
        docs: "https://docs.gebeta.app/docs/direction",
        limits: COMMON_LIMITS,
        features: [
            { title: "Full geometry", body: "Every vertex of the route, so the line on your map matches the road." },
            { title: "Distance and time", body: "Total metres and travel time in seconds with each response." },
            { title: "Waypoints", body: "Route through intermediate stops in a single request." },
            { title: `Under ${LATENCY.routing} ms`, body: "Quick enough to re-route a driver the moment they leave the path." },
        ],
        useCases: [
            { title: "Ride-hailing", body: "Show the rider the route and the price before they book." },
            { title: "Delivery ETAs", body: "Tell customers when the order arrives, and keep it updated." },
            { title: "In-app navigation", body: "Guide drivers turn by turn with the SDK's navigation manager." },
        ],
        article: {
            title: "How directions work",
            paragraphs: [
                "Directions returns the driving route between two points: every vertex of the line along real roads, the total distance and the expected travel time. Ask for turn-by-turn instructions and each step comes with its text, such as Turn right onto Jomo Kenyatta Avenue, its length and where it begins on the line.",
                "Routes follow the road network, including one-way streets and roundabouts, so the line you draw is the line a driver follows. Add waypoints to pass through stops in a fixed order; if the order is up to you, route optimization picks the best one.",
                "Most requests return in under 400 ms, quick enough to re-route a driver who leaves the path or to refresh an ETA every few seconds. The SDK can draw the route for you, or you can draw the geometry with your own map styling.",
            ],
        },
    },
    {
        slug: "matrix",
        demo: "matrix",
        name: "Matrix",
        summary: "Travel times between many points at once",
        title: "Every origin to every stop",
        description:
            "Distances and drive times between every pair in a list of up to ten points, in one request. The building block for dispatch, pricing and ETA tables.",
        latency: { bound: "<", ms: LATENCY.routing },
        docs: "https://docs.gebeta.app/docs/matrix",
        limits: ["Up to 10 points per request", ...COMMON_LIMITS],
        features: [
            { title: "Every pair", body: "Ten points give you all 100 distances and times in one response." },
            { title: "Road distance, not straight lines", body: "Each cell is a real driving route, in kilometres and seconds." },
            { title: "Asymmetric", body: "A to B and B to A are measured separately, as one-way streets demand." },
            { title: `Under ${LATENCY.routing} ms`, body: "Fast enough to price a trip while the customer waits." },
        ],
        useCases: [
            { title: "Nearest driver", body: "Pick the courier who can reach the pickup first, not the one closest as the crow flies." },
            { title: "Distance-based pricing", body: "Quote delivery fees from real road distance." },
            { title: "Service areas", body: "Check which branch can reach a customer within the promised time." },
        ],
        article: {
            title: "How the matrix works",
            paragraphs: [
                "The matrix answers a whole table of questions in one request: from each of these points, how far and how long to each of the others? Send up to ten points and you get every pair back, measured along real roads, in kilometres and seconds.",
                "Each direction is measured separately, because getting from A to B is often not the same as B to A once one-way streets and turns are counted. That is what makes the numbers usable for real decisions rather than estimates.",
                "Use it to find the courier who can reach a pickup first, to price deliveries by road distance, or to check which branch can serve a customer within the promised time. When you need the order to visit them in, pass the same points to route optimization.",
            ],
        },
    },
    {
        slug: "route-optimization",
        demo: "optimization",
        name: "Route optimization",
        summary: "The best order to visit a list of stops",
        title: "Ten stops, one best order",
        description:
            "Give it the stops for a delivery run and get them back in the order that drives the least. Fewer kilometres, less fuel, more drops per shift.",
        latency: { bound: "<", ms: LATENCY.routing },
        docs: "https://docs.gebeta.app/docs/route-optimization",
        limits: ["Up to 10 stops per request", ...COMMON_LIMITS],
        features: [
            { title: "Solves the order for you", body: "A travelling-salesman solver over real drive times between your stops." },
            { title: "Starts where you start", body: "The first point is the depot; the route is built from there." },
            { title: "Real road times", body: "Optimises on driving distance, so one-way streets and detours count." },
            { title: `Under ${LATENCY.routing} ms`, body: "Re-plan a run whenever an order is added or cancelled." },
        ],
        useCases: [
            { title: "Last-mile delivery", body: "Sequence a courier's parcels before they leave the hub." },
            { title: "Field service", body: "Plan a technician's visits for the day." },
            { title: "Collections", body: "Route cash, sample or waste pick-ups in the fewest kilometres." },
        ],
        article: {
            title: "How route optimization works",
            paragraphs: [
                "Route optimization takes a depot and a list of stops and returns the order to visit them that drives the least. It weighs the real drive time between every pair of stops, so a stop that looks close on the map but sits behind a one-way detour is placed where it actually fits.",
                `On our demo run of ${DEMO_OPTIMIZATION.entered.length - 2} stops across Addis Ababa, visiting them in the order they were entered takes ${DEMO_OPTIMIZATION.enteredMinutes} minutes of driving; the optimized order takes ${DEMO_OPTIMIZATION.bestMinutes}. The saving grows with every stop you add, and it compounds over a fleet and a week of runs.`,
                "Send up to ten stops per request. Re-run the optimization whenever an order is added or cancelled, then use directions to draw the route and guide the driver stop by stop.",
            ],
        },
    },
    {
        slug: "one-to-many",
        demo: "onm",
        name: "One-to-many",
        summary: "Routes from one origin to several destinations",
        title: "One start, many routes",
        description:
            "Route from a single origin to up to five destinations in one call. See every option side by side and send the right one.",
        latency: { bound: "<", ms: LATENCY.routing },
        docs: "https://docs.gebeta.app/docs/onm",
        limits: ["Up to 5 destinations per request", ...COMMON_LIMITS],
        features: [
            { title: "One request", body: "All routes from the origin come back together, ready to compare." },
            { title: "Full routes, not just numbers", body: "Each destination gets its geometry, distance and time." },
            { title: "Made for choice", body: "Rank branches, warehouses or drivers by how quickly they can be reached." },
            { title: `Under ${LATENCY.routing} ms`, body: "Instant enough to run when the customer opens the app." },
        ],
        useCases: [
            { title: "Closest branch", body: "Send the customer to the store, pharmacy or bank they can reach soonest." },
            { title: "Dispatch from a hub", body: "See every delivery leaving the warehouse at once." },
            { title: "Coverage checks", body: "Compare travel times from a candidate site to the places that matter." },
        ],
        article: {
            title: "How one-to-many works",
            paragraphs: [
                "One-to-many routes from a single starting point to several destinations in one call. Each destination comes back with its own route, distance and travel time, so you can compare them side by side.",
                "It fits the moment a choice has to be made: which branch, pharmacy or warehouse can the customer reach soonest, or which of today's deliveries should leave the hub first. Ranking by real drive time rather than straight-line distance avoids sending someone across a river or around a closed road.",
                "Send up to five destinations per request. For many origins and many destinations at once, the matrix is the better fit; for the order to visit them all, use route optimization.",
            ],
        },
    },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productHref = (slug: string) => `/products/${slug}`;
