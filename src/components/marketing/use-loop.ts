"use client";

import { useEffect, type RefObject } from "react";
import { useInView, useReducedMotion } from "motion/react";

export const sleep = (ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const id = window.setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
            window.clearTimeout(id);
            reject(signal.reason);
        });
    });

export function useLoop(ref: RefObject<Element>, step: (signal: AbortSignal) => Promise<void>, deps: unknown[] = [], enabled = true) {
    const inView = useInView(ref, { amount: 0.4 });
    const reduceMotion = useReducedMotion();
    useEffect(() => {
        if (!inView || reduceMotion || !enabled) return;
        const controller = new AbortController();
        (async () => {
            while (!controller.signal.aborted) await step(controller.signal);
        })().catch(() => undefined);
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, reduceMotion, enabled, ...deps]);
    return { inView, reduceMotion };
}
