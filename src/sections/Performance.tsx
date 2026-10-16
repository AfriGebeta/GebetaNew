"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { PERFORMANCE, SERVICES } from "@/constants/landing";
import { DURATION, EASE, IN_VIEW, STAGGER, rise, stagger } from "@/lib/motion";

const BAR_TONE = {
    primary: "bg-primary",
    muted: "bg-line-strong",
    foreground: "bg-foreground",
} as const;

function BigFigure() {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, IN_VIEW);
    const reduceMotion = useReducedMotion();
    const mv = useMotionValue(reduceMotion ? PERFORMANCE.headline.value : 0);
    const text = useTransform(mv, (v) => Math.round(v).toString());
    useEffect(() => {
        if (!inView || reduceMotion) return;
        const controls = animate(mv, PERFORMANCE.headline.value, { duration: DURATION.shutter, ease: EASE.out });
        return () => controls.stop();
    }, [inView, reduceMotion, mv]);

    return (
        <p className="flex flex-col gap-3">
            <span ref={ref} className="flex items-baseline gap-3 text-[clamp(120px,18vw,260px)] font-medium leading-[0.8] tracking-[-0.06em] tabular-nums text-foreground">
                <motion.span>{text}</motion.span>
                <span className="text-[0.22em] tracking-[-0.02em] text-soft">{PERFORMANCE.headline.unit}</span>
            </span>
            <span className="text-[18px] text-soft">{PERFORMANCE.headline.label}</span>
        </p>
    );
}

export default function Performance() {
    return (
        <section className="bg-raised">
            <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 md:py-36 lg:grid-cols-12 lg:px-8">
                <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={IN_VIEW} className="flex flex-col gap-10 lg:col-span-6">
                    <motion.div variants={rise} className="flex flex-col gap-4">
                        <h2 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                            {PERFORMANCE.title}
                        </h2>
                        <p className="max-w-[44ch] text-[18px] leading-[1.5] text-soft">{PERFORMANCE.description}</p>
                    </motion.div>
                    <motion.div variants={rise}>
                        <BigFigure />
                    </motion.div>
                </motion.div>

                <motion.div
                    variants={stagger()}
                    initial="hidden"
                    whileInView="show"
                    viewport={IN_VIEW}
                    className="flex flex-col justify-end gap-12 lg:col-span-6"
                >
                    <ul className="flex flex-col gap-5" aria-label="Response time compared">
                        {PERFORMANCE.comparison.map((item, i) => (
                            <motion.li key={item.label} variants={rise} className="flex flex-col gap-2">
                                <span className="flex items-baseline justify-between gap-4 text-[15px]">
                                    <span className="text-foreground">{item.label}</span>
                                    <span className="tabular-nums text-soft">{item.ms} ms</span>
                                </span>
                                <span className="block h-3 overflow-hidden rounded-full bg-card">
                                    <motion.span
                                        className={cn("block h-full origin-left rounded-full", BAR_TONE[item.tone])}
                                        style={{ width: `${(item.ms / PERFORMANCE.scaleMaxMs) * 100}%` }}
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={IN_VIEW}
                                        transition={{ duration: DURATION.shutter, ease: EASE.out, delay: i * STAGGER * 2 }}
                                    />
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    <motion.dl variants={rise} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {SERVICES.map((service) => (
                            <div key={service.id} className="flex flex-col gap-2 rounded-lg bg-card p-4">
                                <dt className="text-[14px] text-soft">{service.name}</dt>
                                <dd className="text-[24px] font-medium leading-none tracking-[-0.02em] tabular-nums text-foreground">
                                    {service.bound} {service.latencyMs} ms
                                </dd>
                            </div>
                        ))}
                    </motion.dl>
                    <motion.p variants={rise} className="text-[14px] text-soft">
                        {PERFORMANCE.footnote}
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
