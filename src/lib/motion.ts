import type { Transition, Variants } from "motion/react";

/**
 * Motion tokens shared by the marketing site and the dashboard.
 * Curves mirror the `ease-power*` timing functions in tailwind.config.js.
 */
export const EASE = {
  out: [0.25, 1, 0.5, 1],
  inOut: [0.65, 0, 0.35, 1],
  smooth: [0.7, 0, 0, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
  entrance: 0.7,
  shutter: 1.1,
} as const;

export const STAGGER = 0.08;
export const STAGGER_BLUR = 0.05; // resurf.so cadence: first item at 0.05s, +0.05s per item
export const RISE = 24;

export const SPRING = {
  snappy: { type: "spring", stiffness: 420, damping: 32 },
  soft: { type: "spring", stiffness: 180, damping: 24 },
  drop: { type: "spring", stiffness: 520, damping: 18, mass: 0.8 },
} as const satisfies Record<string, Transition>;

export const IN_VIEW = { once: true, amount: 0.3 } as const;
export const IN_VIEW_EARLY = { once: true, amount: 0.1 } as const;

export const stagger = (delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren } },
});

export const rise: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.entrance, ease: EASE.out } },
};

// opacity+y only via framer (compositor-safe); blur runs as a CSS animation on the same element
// so the browser can optimise it independently of the JS animation frame loop.
export const blurFadeRise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.out } },
};

export const staggerBlur = (delayChildren = STAGGER_BLUR): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: STAGGER_BLUR, delayChildren } },
});

export const DEMO_TIMING = {
  typeCharMs: 55,
  holdResultsMs: 900,
  routeDrawMs: 1800,
  driveMs: 5000,
  tourDriveMs: 12000,
  fanDriveMs: 6000,
  restMs: 2600,
  tourRestMs: 900,
} as const;
