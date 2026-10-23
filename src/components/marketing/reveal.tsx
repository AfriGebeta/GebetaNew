"use client";

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { motion } from "motion/react";
import { IN_VIEW, rise, stagger } from "@/lib/motion";

// Standard stagger container (rise variant children)
export function Reveal({ delay = 0, ...props }: ComponentProps<typeof motion.div> & { delay?: number }) {
    return <motion.div variants={stagger(delay)} initial="hidden" whileInView="show" viewport={IN_VIEW} {...props} />;
}

export function RevealItem(props: ComponentProps<typeof motion.div>) {
    return <motion.div variants={rise} {...props} />;
}

// ─── Blur reveal — pure CSS animation, zero JS per-frame cost ─────────────────
// The parent watches the viewport and sets --reveal-play-state: running on children.
// Each child uses animate-blur-fade-rise with animation-play-state driven by that var.

type RevealBlurProps = { delay?: number } & Omit<ComponentProps<"div">, "ref">;

export function RevealBlur({ delay = 0, className, children, ...props }: RevealBlurProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setPlaying(true); observer.disconnect(); } },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{ "--reveal-play-state": playing ? "running" : "paused" } as CSSProperties}
            {...props}
        >
            {children}
        </div>
    );
}

type RevealBlurItemProps = { index?: number } & ComponentProps<"div">;

// Each item staggers via animation-delay. index prop overrides auto-stagger if needed.
export function RevealBlurItem({ className, style, index, children, ...props }: RevealBlurItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [delay, setDelay] = useState<number | null>(null);

    useEffect(() => {
        // Auto-compute stagger index from DOM position among siblings
        const el = ref.current;
        if (!el || index !== undefined) return;
        const siblings = Array.from(el.parentElement?.children ?? []);
        const i = siblings.indexOf(el);
        setDelay(0.05 + i * 0.05);
    }, [index]);

    const animDelay = index !== undefined ? 0.05 + index * 0.05 : (delay ?? 0.05);

    return (
        <div
            ref={ref}
            className={["blur-fade-rise-item", className].filter(Boolean).join(" ")}
            style={{ animationDelay: `${animDelay}s`, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
