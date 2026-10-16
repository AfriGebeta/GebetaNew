import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Container from "@/sections/Container";
import CallToAction from "@/sections/CallToAction";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Tag from "@/components/ui/tag";
import ProductDemo from "@/components/marketing/product-demo";
import { Reveal, RevealItem } from "@/components/marketing/reveal";
import { PRODUCTS, productBySlug, productHref } from "@/constants/products";

type Params = { params: { slug: string } };

export function generateStaticParams() {
    return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
    const product = productBySlug(params.slug);
    if (!product) return {};
    return {
        title: `${product.name} API`,
        description: product.description,
        alternates: { canonical: productHref(product.slug) },
    };
}

const SECTION_TITLE = "text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[40px]";

export default function ProductPage({ params }: Params) {
    const product = productBySlug(params.slug);
    if (!product) notFound();
    const others = PRODUCTS.filter((p) => p.slug !== product.slug);

    return (
        <main>
            {/* Hero: the claim, then the product doing it */}
            <section className="py-16 md:py-24">
                <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                    <Reveal className="flex flex-col gap-6 lg:col-span-5 lg:pt-8">
                        <RevealItem>
                            <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[clamp(52px,4.6vw,68px)]">
                                {product.name}
                            </h1>
                        </RevealItem>
                        <RevealItem className="flex flex-col gap-3">
                            <p className="text-balance text-[24px] font-medium leading-[1.25] tracking-[-0.015em] text-foreground">{product.title}</p>
                            <p className="max-w-[44ch] text-[18px] leading-[1.5] text-soft">{product.description}</p>
                        </RevealItem>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button href="/auth/register" size="xl" className="auth-signed-out">
                                Get an API key <ArrowRight aria-hidden />
                            </Button>
                            <Button href="/dashboard/api-token" size="xl" className="auth-signed-in">
                                Your API keys <ArrowRight aria-hidden />
                            </Button>
                            <Button href={product.docs} variant="secondary" size="xl" target="_blank" rel="noreferrer">
                                Read the docs <ArrowUpRight aria-hidden />
                            </Button>
                        </div>
                    </Reveal>

                    <Reveal className="lg:col-span-7">
                        <RevealItem>
                            <Card className="relative h-[460px] overflow-hidden bg-raised md:h-[540px]">
                                <ProductDemo demo={product.demo} />
                            </Card>
                        </RevealItem>
                    </Reveal>
                </Container>
            </section>

            {/* What it does */}
            <section className="bg-raised py-24 md:py-28">
                <Container className="grid gap-12 lg:grid-cols-12">
                    <Reveal className="lg:col-span-4">
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>What you get</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
                        {product.features.map((feature) => (
                            <RevealItem key={feature.title} className="flex flex-col gap-2">
                                <h3 className="text-[20px] font-medium leading-[1.25] text-foreground">{feature.title}</h3>
                                <p className="text-[16px] leading-[1.55] text-soft">{feature.body}</p>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            {/* How it works: a short explainer; the API reference lives in the docs */}
            <section className="py-24 md:py-28">
                <Container className="grid gap-10 lg:grid-cols-12">
                    <Reveal className="lg:col-span-4">
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>{product.article.title}</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="flex max-w-[62ch] flex-col gap-6 lg:col-span-7 lg:col-start-6">
                        {product.article.paragraphs.map((paragraph) => (
                            <RevealItem key={paragraph.slice(0, 32)}>
                                <p className="text-[18px] leading-[1.65] text-foreground">{paragraph}</p>
                            </RevealItem>
                        ))}
                        <RevealItem>
                            <Link
                                href={product.docs}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[16px] font-medium text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 hover:decoration-foreground"
                            >
                                Parameters, limits and examples in the API reference <ArrowUpRight aria-hidden className="size-4" />
                            </Link>
                        </RevealItem>
                    </Reveal>
                </Container>
            </section>

            {/* Who uses it */}
            <section className="pb-24 md:pb-28">
                <Container className="flex flex-col gap-10">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>Built for</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-3 md:grid-cols-3">
                        {product.useCases.map((useCase) => (
                            <RevealItem key={useCase.title} className="flex flex-col gap-2 rounded-lg bg-raised p-6">
                                <h3 className="text-[18px] font-medium text-foreground">{useCase.title}</h3>
                                <p className="text-[15px] leading-[1.55] text-soft">{useCase.body}</p>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            {/* The rest of the platform */}
            <section className="bg-raised py-24 md:py-28">
                <Container className="flex flex-col gap-10">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>Works with the rest</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {others.map((other) => (
                            <RevealItem key={other.slug}>
                                <Link
                                    href={productHref(other.slug)}
                                    className="group flex h-full flex-col gap-2 rounded-lg bg-card p-5 shadow-card outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/60"
                                >
                                    <span className="flex items-center justify-between gap-2 text-[16px] font-medium text-foreground">
                                        {other.name}
                                        <ArrowRight aria-hidden className="size-4 text-soft transition-transform duration-150 ease-power3-out group-hover:translate-x-0.5" />
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
