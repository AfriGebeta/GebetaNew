import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Linkedin } from "lucide-react";
import Container from "@/sections/Container";
import CallToAction from "@/sections/CallToAction";
import Button from "@/components/ui/button";
import { Reveal, RevealItem } from "@/components/marketing/reveal";
import { COMPANY, initials } from "@/constants/company";

export const metadata: Metadata = {
    title: "About",
    description:
        "GebetaMaps builds mapping and location infrastructure for Africa - geocoding, routing and location intelligence designed around local data, from Addis Ababa.",
    alternates: { canonical: "/company" },
    openGraph: {
        title: "About GebetaMaps",
        description: "GebetaMaps builds mapping and location infrastructure for Africa, designed around local data.",
        url: "/company",
        type: "website",
    },
};

const SECTION_TITLE = "text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[40px]";

export default function Company() {
    return (
        <main>
            <section className="py-16 md:py-24">
                <Container className="grid gap-16 lg:grid-cols-12 lg:gap-8">
                    <Reveal className="flex flex-col gap-6 lg:col-span-6">
                        <RevealItem>
                            <h1 className="text-[48px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[clamp(56px,6vw,88px)]">
                                {COMPANY.title}
                            </h1>
                        </RevealItem>
                        <RevealItem>
                            <p className="max-w-[44ch] text-[18px] leading-[1.5] text-soft">{COMPANY.description}</p>
                        </RevealItem>
                        <RevealItem className="flex flex-wrap gap-3">
                            <Button href="/contact" size="xl">
                                Talk to us <ArrowRight aria-hidden />
                            </Button>
                            <Button href="/#products" variant="secondary" size="xl">
                                Explore the APIs
                            </Button>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-8 sm:grid-cols-3 lg:col-span-5 lg:col-start-8 lg:grid-cols-1">
                        {COMPANY.stats.map((stat) => (
                            <RevealItem key={stat.label} className="flex flex-col gap-2">
                                <p className="text-[56px] font-medium leading-none tracking-[-0.04em] tabular-nums text-foreground md:text-[64px]">
                                    {stat.value}
                                </p>
                                <p className="text-[17px] leading-[1.45] text-soft">{stat.label}</p>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <section className="py-24 md:py-28">
                <Container className="grid gap-12 lg:grid-cols-12">
                    <Reveal className="lg:col-span-4">
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>Who we are</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="flex flex-col gap-10 lg:col-span-7 lg:col-start-6">
                        {COMPANY.story.map((item) => (
                            <RevealItem key={item.title} className="flex flex-col gap-3">
                                <h3 className="text-[22px] font-medium leading-[1.25] text-foreground">{item.title}</h3>
                                <p className="max-w-[60ch] text-[18px] leading-[1.6] text-foreground">{item.body}</p>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <section className="bg-raised py-24 md:py-28">
                <Container className="flex flex-col gap-12">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>The team</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
                        {COMPANY.team.map((member) => (
                            <RevealItem key={member.name} className="flex flex-col gap-4">
                                {member.img ? (
                                    <Image
                                        src={member.img}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="size-16 rounded-full bg-card object-cover shadow-card"
                                    />
                                ) : (
                                    <span
                                        aria-hidden
                                        className="flex size-16 items-center justify-center rounded-full bg-card text-[20px] font-medium tracking-[-0.01em] text-foreground shadow-card"
                                    >
                                        {initials(member.name)}
                                    </span>
                                )}
                                <span className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2 text-[18px] font-medium text-foreground">
                                        {member.name}
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${member.name} on LinkedIn`}
                                                className="text-soft transition-colors hover:text-foreground"
                                            >
                                                <Linkedin aria-hidden className="size-4" />
                                            </a>
                                        )}
                                    </span>
                                    <span className="text-[15px] text-soft">{member.role}</span>
                                </span>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <section className="py-24 md:py-28">
                <Container className="flex flex-col gap-12">
                    <Reveal>
                        <RevealItem>
                            <h2 className={SECTION_TITLE}>What we hold to</h2>
                        </RevealItem>
                    </Reveal>
                    <Reveal className="grid gap-10 md:grid-cols-3">
                        {COMPANY.values.map((value) => (
                            <RevealItem key={value.title} className="flex flex-col gap-3">
                                <h3 className="text-[24px] font-medium tracking-[-0.01em] text-foreground">{value.title}</h3>
                                <p className="text-[17px] leading-[1.55] text-soft">{value.body}</p>
                            </RevealItem>
                        ))}
                    </Reveal>
                </Container>
            </section>

            <CallToAction />
        </main>
    );
}
