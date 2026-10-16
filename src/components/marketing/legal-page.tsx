import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/sections/Container";
import { cn } from "@/lib/utils";
import { LEGAL_PAGES } from "@/constants/legal";

/**
 * Shared frame for the privacy policy and terms: the site's page header, a switch between the two documents,
 * and a reading column. The body uses the blog's MDX styles, so long text reads the same everywhere.
 */
export default function LegalPage({
    current,
    title,
    description,
    updated,
    children,
}: {
    current: (typeof LEGAL_PAGES)[number]["href"];
    title: string;
    description: string;
    updated?: string;
    children: ReactNode;
}) {
    return (
        <Container>
            <article className="mx-auto max-w-[720px] py-16 md:py-24">
                <header className="mb-10 flex flex-col gap-4 border-b border-border pb-10">
                    <nav aria-label="Legal documents" className="flex flex-wrap gap-1">
                        {LEGAL_PAGES.map((page) => (
                            <Link
                                key={page.href}
                                href={page.href}
                                aria-current={page.href === current ? "page" : undefined}
                                className={cn(
                                    "rounded-full px-3 py-1.5 text-[14px] transition-colors duration-150 ease-power3-out",
                                    page.href === current ? "bg-raised font-medium text-foreground" : "text-soft hover:text-foreground",
                                )}
                            >
                                {page.label}
                            </Link>
                        ))}
                    </nav>
                    <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[64px]">{title}</h1>
                    <p className="max-w-[48ch] text-[18px] leading-[1.5] text-soft">{description}</p>
                    {updated && <p className="text-[15px] text-subtle">Last updated {updated}</p>}
                </header>
                {children}
            </article>
        </Container>
    );
}
