"use client";

import { motion } from "motion/react";
import { BENTO } from "@/constants/landing";
import { IN_VIEW, rise, stagger } from "@/lib/motion";
import {
    DirectionsTile,
    GeocodingTile,
    MatrixTile,
    OptimizationTile,
    SdkTile,
    TilesTile,
} from "@/components/marketing/bento-tiles";

export default function Bento() {
    return (
        <section id="products" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-36 lg:px-8">
            <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={IN_VIEW} className="flex max-w-2xl flex-col gap-4">
                <motion.h2 variants={rise} className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                    {BENTO.title}
                </motion.h2>
                <motion.p variants={rise} className="text-[18px] leading-[1.5] text-soft">
                    {BENTO.description}
                </motion.p>
            </motion.div>

            <motion.div
                variants={stagger()}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="mt-12 grid auto-rows-[minmax(0,auto)] gap-3 md:grid-cols-2 lg:grid-cols-6"
            >
                <TilesTile className="md:col-span-2 lg:col-span-4 lg:row-span-2" />
                <GeocodingTile className="lg:col-span-2" />
                <DirectionsTile className="lg:col-span-2" />
                <MatrixTile className="lg:col-span-2" />
                <OptimizationTile className="lg:col-span-2" />
                <SdkTile className="md:col-span-2 lg:col-span-2" />
            </motion.div>
        </section>
    );
}
