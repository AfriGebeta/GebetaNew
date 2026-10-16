"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { CTA } from "@/constants/landing";
import { IN_VIEW, rise, stagger } from "@/lib/motion";

export default function CallToAction() {
    return (
        <section className="bg-ink text-ink-foreground">
            <motion.div
                variants={stagger()}
                initial="hidden"
                whileInView="show"
                viewport={IN_VIEW}
                className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 md:py-32 lg:px-8"
            >
                <motion.h2 variants={rise} className="max-w-[12ch] text-[48px] font-medium leading-[0.95] tracking-[-0.04em] md:text-[clamp(56px,7vw,104px)]">
                    {CTA.title}
                </motion.h2>
                <motion.p variants={rise} className="max-w-[44ch] text-[18px] leading-[1.5] text-ink-foreground/70">
                    {CTA.description}
                </motion.p>
                <div className="flex flex-wrap gap-3">
                    <Button href={CTA.primary.href} size="xl">
                        {CTA.primary.label} <ArrowRight aria-hidden />
                    </Button>
                    <Button href={CTA.secondary.href} variant="ghost" size="xl" className="text-ink-foreground/80 hover:bg-ink-foreground/10 hover:text-ink-foreground">
                        {CTA.secondary.label}
                    </Button>
                </div>
            </motion.div>
        </section>
    );
}
