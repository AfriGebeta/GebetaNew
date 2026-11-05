import { DEMO_OPTIMIZATION } from "@/constants/demo-routes";

export type Solution = {
    slug: string;
    name: string;
    summary: string;
    title: string;
    description: string;
    sections: { title: string; paragraphs: string[] }[];
    products: string[];
};

const TOUR = {
    stops: DEMO_OPTIMIZATION.entered.length - 2,
    entered: DEMO_OPTIMIZATION.enteredMinutes,
    best: DEMO_OPTIMIZATION.bestMinutes,
    enteredKm: Math.round(DEMO_OPTIMIZATION.enteredKm),
    bestKm: Math.round(DEMO_OPTIMIZATION.bestKm),
};
const TOUR_ORDERS = Array.from({ length: TOUR.stops }, (_, i) => i + 1).reduce((n, k) => n * k, 1);

export const SOLUTIONS: Solution[] = [
    {
        slug: "ride-hailing",
        name: "Ride-hailing & mobility",
        summary: "Find the nearest driver and quote the fare before the trip",
        title: "Every ride starts with the right driver.",
        description:
            "Match riders to the closest driver by real road time, not straight-line distance, and show a fare before the trip starts.",
        sections: [
            {
                title: "Closest on the map isn't closest on the road",
                paragraphs: [
                    "A driver 800 metres away on the other side of a divided road or a one-way street can take longer to arrive than one two kilometres away on the same street. Dispatch that ranks drivers by straight-line distance keeps sending the wrong car, and the rider keeps waiting.",
                    "The Matrix API takes every candidate driver and the rider, and returns the driving time and distance for each pair in a single request. Rank by the time the rider will actually wait, and send the driver at the top.",
                ],
            },
            {
                title: "A fare the rider can trust",
                paragraphs: [
                    "Quoting before the trip means knowing the trip before it starts. Directions returns the distance and duration of the route the driver will take, so your pricing works from real numbers instead of an estimate, and the same route goes straight to the driver's navigation.",
                ],
            },
            {
                title: "Pickups people can describe",
                paragraphs: [
                    "Few riders in Addis Ababa give a street address. They say \"in front of Edna Mall\" or \"near Meskel Square\". Geocoding searches places by the names people use and returns coordinates, so the pickup pin lands where the rider means.",
                ],
            },
        ],
        products: ["matrix", "directions", "geocoding"],
    },
    {
        slug: "logistics",
        name: "Delivery & logistics",
        summary: "Plan the day's routes and dispatch from the nearest depot",
        title: "More deliveries, fewer kilometres.",
        description: "Turn a list of drops into the best route for each driver, and give every customer an arrival time that holds up.",
        sections: [
            {
                title: "The order of the stops is the cost",
                paragraphs: [
                    `A driver with ${TOUR.stops} drops can visit them in ${TOUR_ORDERS.toLocaleString("en-US")} different orders, and the order they were entered in is rarely the best one. Every extra kilometre is fuel, time and one fewer delivery before the end of the shift.`,
                    `Take a ${TOUR.stops}-stop round across Addis Ababa, starting and ending at Meskel Square. Driven in the order it was entered, it takes ${TOUR.entered} minutes and ${TOUR.enteredKm} km. Route optimization finds an order that takes ${TOUR.best} minutes and ${TOUR.bestKm} km: ${TOUR.entered - TOUR.best} minutes saved on one round, for one driver.`,
                ],
            },
            {
                title: "Dispatch from the right place",
                paragraphs: [
                    "When an order comes in, the question is which depot, branch or driver reaches it first. One-to-many returns the travel time from one point to up to five others in a single call, so dispatch can compare the options side by side instead of guessing from the map.",
                ],
            },
            {
                title: "Arrival times that hold up",
                paragraphs: [
                    "Directions gives each leg its real driving time and distance, with turn-by-turn steps for the driver. Customers get an arrival time built from the roads the driver is actually on.",
                ],
            },
        ],
        products: ["route-optimization", "one-to-many", "directions"],
    },
    {
        slug: "commerce",
        name: "Food & e-commerce",
        summary: "Turn the address a customer types into a door your rider can find",
        title: "Addresses people actually use.",
        description:
            "Customers write \"behind Edna Mall\" or \"near Bole Medhanialem\". Gebeta turns landmarks into coordinates your riders can drive to.",
        sections: [
            {
                title: "Where street addresses run out",
                paragraphs: [
                    "Most deliveries in Addis Ababa are described, not addressed: a building next to a landmark, a gate behind a church, a shop across from a bank. A checkout form that only understands street names sends riders to call the customer for directions, order after order.",
                    "Geocoding searches landmarks, businesses and neighbourhoods by the names people actually type, and returns a coordinate for the order.",
                ],
            },
            {
                title: "From a pin to a place",
                paragraphs: [
                    "When a customer drops a pin instead, Geocoding works the other way: it turns the coordinate into the nearest named place. The rider sees \"next to the pharmacy on Africa Avenue\", not a pair of numbers.",
                ],
            },
            {
                title: "The closest kitchen, by road",
                paragraphs: [
                    "With several branches, the nearest one on the map isn't always the fastest to reach. One-to-many compares travel time from the customer to up to five branches in one request, so each order goes to the kitchen or store that gets it there first.",
                ],
            },
        ],
        products: ["geocoding", "one-to-many", "directions"],
    },
    {
        slug: "fintech",
        name: "Fintech & payments",
        summary: "Check customer addresses and map your agent network",
        title: "Know where your customers and agents are.",
        description: "Check addresses at onboarding and see your agent network on a map, so you know where coverage is thin.",
        sections: [
            {
                title: "Addresses checked at sign-up",
                paragraphs: [
                    "Onboarding forms collect an address as free text, and nobody checks it until something goes wrong. Geocoding matches what the customer enters to a real place when they sign up, so the addresses that don't resolve can be reviewed before the account goes live.",
                ],
            },
            {
                title: "Your agent network, on one map",
                paragraphs: [
                    "Agents, branches and merchants are usually rows in a spreadsheet. Put them on a map and the gaps show: the neighbourhood with no cash-in point, the street with three. Map tiles render your network with your own markers, in street or satellite view.",
                ],
            },
            {
                title: "The nearest agent for every customer",
                paragraphs: [
                    "When a customer needs an agent, the useful answer is the one they can reach fastest. One-to-many ranks up to five agents by travel time from the customer in a single request.",
                ],
            },
        ],
        products: ["geocoding", "maps", "one-to-many"],
    },
    {
        slug: "public-sector",
        name: "Government & public sector",
        summary: "Plan and serve citizens with detailed local maps",
        title: "Maps built for the cities you serve.",
        description: "Local place names and local roads, ready for planning, service delivery and field operations.",
        sections: [
            {
                title: "A map of the city as it is",
                paragraphs: [
                    "Planning starts with a map that shows what is actually on the ground. Gebeta's map tiles carry roads, buildings, land use and points of interest, in street, satellite and terrain styles, so teams can see a district, switch to imagery to check a plot, and switch back.",
                ],
            },
            {
                title: "Found by the names people use",
                paragraphs: [
                    "Citizens look for offices, schools and clinics by the names they know them by, not by coordinates. Geocoding searches those names and returns the place, so a service directory or an emergency form can point to the right building.",
                ],
            },
            {
                title: "Field visits in the right order",
                paragraphs: [
                    "Inspectors, health workers and survey teams visit many sites in a day. Route optimization puts the visits in the order that takes the least driving, so teams spend their time at the sites instead of between them.",
                ],
            },
        ],
        products: ["maps", "geocoding", "route-optimization"],
    },
];

export const solutionBySlug = (slug: string) => SOLUTIONS.find((s) => s.slug === slug);
export const solutionHref = (slug: string) => `/solutions/${slug}`;
