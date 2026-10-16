import { PRODUCTS } from "@/constants/products";

export type TeamMember = { name: string; role: string };

export const COMPANY = {
    title: "Mapping Africa's future",
    description:
        "Gebeta Maps builds the maps, search and routing that African businesses run on, designed around local data.",
    stats: [
        { value: "1,000+", label: "businesses and public institutions" },
        { value: String(PRODUCTS.length), label: "location APIs on one key" },
        { value: "2", label: "countries served today: Ethiopia and Djibouti" },
    ],
    story: [
        {
            title: "Rooted in Addis Ababa",
            body: "Our headquarters are in Addis Ababa, where the map started: built around local streets, landmarks and businesses, so the places people name are the places you find.",
        },
        {
            title: "Built for Africa",
            body: "We serve customers in Ethiopia and Djibouti today, and we are in talks with companies in Nigeria, Kenya and other African countries as we grow across the continent.",
        },
        {
            title: "A plan for every builder",
            body: "Individuals, startups and enterprises build on the same APIs: navigation, route planning, geocoding and live location, priced by use so you only pay for what you call.",
        },
    ],
    team: [
        { name: "Bemhreth Gezahagh", role: "Chief Executive Officer" },
        { name: "Abenezer Seifu", role: "Chief Technology Officer" },
        { name: "Beniyas Tesfa", role: "Chief Technology Officer" },
        { name: "Rahel", role: "Finance" },
        { name: "Daniel Berihun", role: "Senior Developer" },
        { name: "Berekt Terefe", role: "Senior Developer" },
        { name: "Zubeyr Anwar", role: "Software Engineer" },
        { name: "Kirubel", role: "Software Engineer" },
    ] satisfies TeamMember[],
    values: [
        { title: "Innovation", body: "We keep pushing what a map can do for the people and businesses that depend on it." },
        { title: "Reliability", body: "Accurate data and APIs that answer the same way every time, at any volume." },
        { title: "Customer service", body: "A team close to its customers, ready to help you ship your location features." },
    ],
} as const;

export const initials = (name: string) =>
    name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
