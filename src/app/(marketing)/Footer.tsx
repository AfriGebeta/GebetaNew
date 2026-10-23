import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/sections/Container";
import { Icons } from "@/components/icons";
import { PRODUCTS, productHref } from "@/constants/products";
import { SOLUTIONS } from "@/constants/solutions";

const COLUMNS = [
    {
        title: "Products",
        links: PRODUCTS.map((p) => ({ label: p.name, href: productHref(p.slug) })),
    },
     {
        title: "Solutions",
        links: SOLUTIONS.map((p) => ({ label: p.name, href: productHref(p.slug) })),
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "https://docs.gebeta.app/" },
            { label: "Blog", href: "/blog" },
            { label: "Pricing", href: "/pricing" },
            // { label: "Status", href: "/uptime" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "/company" },
            { label: "Contact", href: "/contact" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
    },
    {
        title: "Social",
        links: [
            { label: "LinkedIn", href: "https://et.linkedin.com/company/gebetamaps", external: true },
            { label: "Telegram", href: "https://t.me/gebetamaps_chat", external: true },
            { label: "Instagram", href: "https://www.instagram.com/gebetamaps", external: true },
            { label: "X (Twitter)", href: "https://x.com/GebetaMaps", external: true },
        ],
    },
];

const STORES = [
    { label: "App Store", caption: "Download on the", href: "https://apps.apple.com/us/app/gebeta-maps/id6793868587", Icon: Icons.apple },
    { label: "Google Play", caption: "Get it on", href: "https://play.google.com/store/apps/details?id=co.gebeta.apps.android.map&hl=en", Icon: Icons.googlePlay },
];

export default function Footer() {
    const Logo = Icons.gebeta;

    return (
        <footer className="bg-raised text-[15px] text-soft">
            <Container className="flex flex-col gap-16 py-16 md:py-24">
                <div className="grid gap-10 md:grid-cols-12">
                    <div className="flex flex-col gap-3 md:col-span-4">
                        <p className="text-[20px] leading-[1.35] text-foreground">Location APIs for Africa.</p>
                        <address className="not-italic leading-[1.5]">
                            Maraki Tower, Megenagha, Addis Ababa, Ethiopia
                            <br />
                            <a href="mailto:info@gebeta.app" className="text-foreground hover:text-soft">info@gebeta.app</a>
                        </address>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {STORES.map(({ label, caption, href, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`${caption} ${label}`}
                                    className="inline-flex h-11 items-center gap-2.5 rounded-lg bg-ink px-3.5 text-ink-foreground transition-opacity duration-150 hover:opacity-85"
                                >
                                    <Icon aria-hidden className="size-5 shrink-0" />
                                    <span className="flex flex-col leading-none">
                                        <span className="text-[10px] opacity-75">{caption}</span>
                                        <span className="mt-0.5 text-[15px] font-medium">{label}</span>
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                    <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
                        {COLUMNS.map((col) => (
                            <div key={col.title} className="flex flex-col gap-3">
                                <h2 className="text-[15px] font-medium text-foreground">{col.title}</h2>
                                <ul className="flex flex-col gap-2">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                {...("external" in link ? { target: "_blank", rel: "noreferrer" } : {})}
                                                className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-foreground"
                                            >
                                                {link.label}
                                                {"external" in link && <ArrowUpRight aria-hidden className="size-3.5" />}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="flex flex-col gap-6">
                    <p aria-hidden className="flex items-center gap-4 text-[15vw] font-medium leading-[0.8] tracking-[-0.05em] text-foreground lg:text-[176px]">
                        <Logo className="hidden size-[0.7em] shrink-0 md:block" />
                        GebetaMaps
                    </p>
                    <p className="text-[14px]">© {new Date().getFullYear()} GebetaMaps, Inc. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
}
