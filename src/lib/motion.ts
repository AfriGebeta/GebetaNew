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
export const RISE = 24;

export const SPRING = {
  snappy: { type: "spring", stiffness: 420, damping: 32 },
  soft: { type: "spring", stiffness: 180, damping: 24 },
  drop: { type: "spring", stiffness: 520, damping: 18, mass: 0.8 },
} as const satisfies Record<string, Transition>;

/** Viewport options for scroll-triggered entrances: fire once, slightly before fully in view. */
export const IN_VIEW = { once: true, amount: 0.3 } as const;

/** Parent: staggers its children's entrance. */
export const stagger = (delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: STAGGER, delayChildren } },
});

/** Child: rises into place. */
export const rise: Variants = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.entrance, ease: EASE.out } },
};

/** Demo timings (ms) for the scripted map animations. */
export const DEMO_TIMING = {
  typeCharMs: 55,
  holdResultsMs: 900,
  routeDrawMs: 1800,
  /** A car driving one cross-town route (hero, directions). */
  driveMs: 9000,
  /** A full multi-stop delivery tour (route optimization). */
  tourDriveMs: 16000,
  /** Several routes revealed at once from one origin (one-to-many). */
  fanDriveMs: 6000,
  restMs: 2600,
} as const;
