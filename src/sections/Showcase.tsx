"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { showcases } from "@/constants";
import SegmentedControl from "@/components/ui/segmented-control";
import { DURATION, EASE, IN_VIEW, rise, stagger } from "@/lib/motion";

const items = showcases.filter((s) => s.title);

export default function Showcase() {
    const [active, setActive] = useState(items[0]?.title ?? "");
    const current = items.find((s) => s.title === active) ?? items[0];

    return (
        <section className="bg-raised">
            <motion.div
                variants={stagger()}
                initial="hidden"
                whileInView="show"
                viewport={IN_VIEW}
                className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-24 sm:px-6 md:py-36 lg:px-8"
            >
                <motion.div variants={rise} className="flex flex-col gap-4">
                    <h2 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                        Built on Gebeta
                    </h2>
                    <p className="max-w-[48ch] text-[18px] leading-[1.5] text-soft">
                        Ride-hailing, national ID registration and delivery, running on our maps today.
                    </p>
                </motion.div>
                <motion.div variants={rise}>
                    <SegmentedControl
                        aria-label="Customer"
                        value={active}
                        onValueChange={setActive}
                        options={items.map((s) => ({ value: s.title, label: s.title }))}
                    />
                </motion.div>
                <motion.div variants={rise} className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-xl bg-card md:h-[520px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.title}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: DURATION.slow, ease: EASE.out }}
                            className="relative size-full"
                        >
                            <Image
                                src={current.showcasePicture}
                                alt={`${current.title} app built with GebetaMaps`}
                                fill
                                sizes="(min-width: 1280px) 1200px, 100vw"
                                className="object-contain p-6"
                            />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </section>
    );
}
