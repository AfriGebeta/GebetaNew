import { PRODUCTS, productHref } from "@/constants/products";
import { SOLUTIONS, solutionHref } from "@/constants/solutions";

export type NavLink = { label: string; href: string; external?: boolean };

export type NavMenuItem = { label: string; summary: string; href: string };

export const NAV_PRODUCTS: NavMenuItem[] = PRODUCTS.map((p) => ({ label: p.name, summary: p.summary, href: productHref(p.slug) }));
export const NAV_SOLUTIONS: NavMenuItem[] = SOLUTIONS.map((s) => ({ label: s.name, summary: s.summary, href: solutionHref(s.slug) }));

export const NAV_LINKS: NavLink[] = [
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Company", href: "/company" },
    { label: "Docs", href: "https://docs.gebeta.app/", external: true },
];

export const NAV_CTA = {
    signIn: { label: "Sign in", href: "/auth/signin" },
    signUp: { label: "Get started", href: "/auth/register" },
    dashboard: { label: "Dashboard", href: "/dashboard" },
    contact: { label: "Contact sales", href: "/contact" },
};

export type NavFeature = { title: string; body: string; links: NavLink[] };

export const NAV_FEATURE: NavFeature = {
    title: "New to Gebeta?",
    body: "Create a free account, copy your key and make your first request in a few lines.",
    links: [
        { label: "Quick start", href: "https://docs.gebeta.app/", external: true },
        { label: "JavaScript SDK", href: "https://afrigebeta.github.io/Gebeta-SDK-JS/", external: true },
        { label: "Pricing", href: "/pricing" },
    ],
};

export const NAV_SOLUTIONS_FEATURE: NavFeature = {
    title: "Building something else?",
    body: "Tell us what you're mapping and we'll show you which APIs fit.",
    links: [],
};

export const NAV_MENUS = [
    { id: "products", label: "Products", basePath: "/products", items: NAV_PRODUCTS, feature: NAV_FEATURE },
    { id: "solutions", label: "Solutions", basePath: "/solutions", items: NAV_SOLUTIONS, feature: NAV_SOLUTIONS_FEATURE },
] as const;
export type NavMenuId = (typeof NAV_MENUS)[number]["id"];

export const ANNOUNCEMENT = {
    text: "The Gebeta Maps app is now on",
    cta: "Download",
    stores: {
        android: { name: "the Play Store", link: "https://play.google.com/store/apps/details?id=co.gebeta.apps.android.map" },
        ios: { name: "the App Store", link: "https://apps.apple.com/us/app/gebeta-maps/id6793868587" },
        other: { name: "the Play Store and App Store", link: "https://play.google.com/store/apps/details?id=co.gebeta.apps.android.map" },
    },
};
