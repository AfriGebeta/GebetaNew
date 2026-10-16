import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Container from "@/sections/Container";
import CallToAction from "@/sections/CallToAction";
import Button from "@/components/ui/button";
import { MDXComponents } from "@/app/(marketing)/blog/_components/MDXComponent";
import { Reveal, RevealItem } from "@/components/marketing/reveal";
import { productBySlug, productHref, type Product } from "@/constants/products";
import { SOLUTIONS, solutionBySlug, solutionHref } from "@/constants/solutions";

type Params = { params: { slug: string } };

export function generateStaticParams() {
    return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
    const solution = solutionBySlug(params.slug);
    if (!solution) return {};
    return {
        title: `${solution.name} location APIs`,
        description: solution.description,
        alternates: { canonical: solutionHref(solution.slug) },
    };
}

const { h2: H2, p: P } = MDXComponents;

const SECTION_TITLE = "text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[40px]";

export default function SolutionPage({ params }: Params) {
    const solution = solutionBySlug(params.slug);
    if (!solution) notFound();
    const products = solution.products.map(productBySlug).filter((p): p is Product => !!p);
    const others = SOLUTIONS.filter((s) => s.slug !== solution.slug);

    return (
        <main>
            <section className="pb-12 pt-16 md:pb-16 md:pt-24">
                <Container>
                    <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                        <RevealItem>
                            <p className="text-[15px] font-medium text-soft">{solution.name}</p>
                        </RevealItem>
                        <RevealItem>
                            <h1 className="text-balance text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[clamp(56px,5.6vw,80px)]">
                                {solution.title}
                            </h1>
                        </RevealItem>
                        <RevealItem>
                            <p className="max-w-[48ch] text-balance text-[20px] leading-[1.5] text-soft">{solution.description}</p>
                        </RevealItem>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Button href="/auth/register" size="xl" className="auth-signed-out">
                                Get an API key <ArrowRight aria-hidden />
                            </Button>
                            <Button href="/dashboard/api-token" size="xl" className="auth-signed-in">
                                Your API keys <ArrowRight aria-hidden />
                            </Button>
                            <Button href="/contact" variant="secondary" size="xl">
                                Talk to sales
                            </Button>
                        </div>
                    </Reveal>
                </Container>
            </section>

            <section className="pb-24 md:pb-28">
                <Container>
                    <article className="mx-auto max-w-[720px] border-t border-border pt-4">
                        {solution.sections.map((section) => (
                            <section key={section.title}>
                                <H2>{section.title}</H2>
                                {section.paragraphs.map((paragraph) => (
                                    <P key={paragraph.slice(0, 32)}>{paragraph}</P>
                                ))}
                            </section>
                        ))}
                    </article>
                </Container>
            </section>

            <section className="bg-raised py-24 md:py-28">
                <Container className="flex flex-col gap-10">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>The APIs behind it</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-3 md:grid-cols-3">
                        {products.map((product) => (
                            <RevealItem key={product.slug}>
                                <Link
                                    href={productHref(product.slug)}
                                    className="group flex h-full flex-col gap-2 rounded-lg bg-card p-6 shadow-card outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/60"
                                >
                                    <span className="flex items-center justify-between gap-2 text-[18px] font-medium text-foreground">
                                        {product.name}
                                        <ArrowRight aria-hidden className="size-4 text-soft transition-transform duration-150 ease-power3-out group-hover:translate-x-0.5" />
                                    </span>
                                    <span className="text-[15px] leading-[1.55] text-soft">{product.summary}</span>
                                </Link>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <section className="py-24 md:py-28">
                <Container className="flex flex-col gap-10">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>More solutions</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {others.map((other) => (
                            <RevealItem key={other.slug}>
                                <Link
                                    href={solutionHref(other.slug)}
                                    className="group flex h-full flex-col gap-2 rounded-lg bg-card p-5 shadow-card outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/60"
                                >
                                    <span className="flex items-center justify-between gap-2 text-[16px] font-medium text-foreground">
                                        {other.name}
                                        <ArrowRight aria-hidden className="size-4 shrink-0 text-soft transition-transform duration-150 ease-power3-out group-hover:translate-x-0.5" />
                                    </span>
                                    <span className="text-[14px] leading-[1.5] text-soft">{other.summary}</span>
                                </Link>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <CallToAction />
        </main>
    );
}
