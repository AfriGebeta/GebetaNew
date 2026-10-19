"use client";

import type { ComponentProps } from "react";
import { motion } from "motion/react";
import { IN_VIEW, rise, stagger } from "@/lib/motion";

export function Reveal({ delay = 0, ...props }: ComponentProps<typeof motion.div> & { delay?: number }) {
    return <motion.div variants={stagger(delay)} initial="hidden" whileInView="show" viewport={IN_VIEW} {...props} />;
}

export function RevealItem(props: ComponentProps<typeof motion.div>) {
    return <motion.div variants={rise} {...props} />;
}
