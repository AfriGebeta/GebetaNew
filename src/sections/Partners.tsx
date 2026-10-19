"use client";

import { motion } from "motion/react";
import Container from "@/sections/Container";
import { IN_VIEW, blurFadeRise, stagger, staggerBlur } from "@/lib/motion";

export default function Partners() {
    return (
        <motion.div variants={staggerBlur()} initial="hidden" whileInView="show" viewport={IN_VIEW}>
        <Container className="flex flex-col gap-6 pb-16 pt-20 md:pb-20 md:pt-24">
            <motion.p variants={blurFadeRise} className="text-[15px] text-soft">Trusted by more than 1,000 businesses and public institutions</motion.p>
            <div className="fade-x h-[80px] w-full overflow-hidden grayscale md:h-[120px] dark:invert">
                <div
                    className="animate-scroll-x h-full w-full bg-[length:auto_64px] bg-repeat-x md:bg-[length:auto_100px]"
                    style={{ backgroundImage: "url(/assets/partner.png)" }}
                />
            </div>
        </Container>
        </motion.div>
    );
}
