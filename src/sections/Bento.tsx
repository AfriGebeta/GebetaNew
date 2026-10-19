"use client";

import { motion } from "motion/react";
import { BENTO } from "@/constants/landing";
import { IN_VIEW, blurFadeRise, staggerBlur } from "@/lib/motion";
import {
    DirectionsTile,
    GeocodingTile,
    MatrixTile,
    OptimizationTile,
    SdkTile,
    TilesTile,
} from "@/components/marketing/bento-tiles";
import { RevealBlur, RevealBlurItem } from "@/components/marketing/reveal";

export default function Bento() {
    return (
        <section id="products" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-36 lg:px-8">
            <motion.div variants={staggerBlur()} initial="hidden" whileInView="show" viewport={IN_VIEW} className="flex max-w-2xl flex-col gap-4">
                <motion.h2 variants={blurFadeRise} className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                    {BENTO.title}
                </motion.h2>
                <motion.p variants={blurFadeRise} className="text-[18px] leading-[1.5] text-soft">
                    {BENTO.description}
                </motion.p>
            </motion.div>

            <RevealBlur className="mt-12 grid auto-rows-[minmax(0,auto)] gap-3 md:grid-cols-2 lg:grid-cols-6">
                <RevealBlurItem className="md:col-span-2 lg:col-span-4 lg:row-span-2"><TilesTile className="h-full" /></RevealBlurItem>
                <RevealBlurItem className="lg:col-span-2"><GeocodingTile /></RevealBlurItem>
                <RevealBlurItem className="lg:col-span-2"><DirectionsTile /></RevealBlurItem>
                <RevealBlurItem className="lg:col-span-2"><MatrixTile /></RevealBlurItem>
                <RevealBlurItem className="lg:col-span-2"><OptimizationTile /></RevealBlurItem>
                <RevealBlurItem className="md:col-span-2 lg:col-span-2"><SdkTile /></RevealBlurItem>
            </RevealBlur>
        </section>
    );
}
