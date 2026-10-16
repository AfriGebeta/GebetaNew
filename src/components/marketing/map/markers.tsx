import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Map markers shared by the live (MapLibre) map and the drawn fallback map.
 * Live markers are rendered to static markup and handed to MapLibre as DOM elements.
 */

const PIN_TONE = {
    /** The destination: the answer, so it carries the brand colour. */
    primary: "fill-primary stroke-primary-foreground/25",
    /** The origin: where the trip starts. */
    ink: "fill-ink stroke-card",
};

/** Teardrop drop-pin, anchored at its tip. */
export function PinGlyph({ className, tone = "primary", ...props }: SVGProps<SVGSVGElement> & { tone?: keyof typeof PIN_TONE }) {
    return (
        <svg viewBox="0 0 32 42" aria-hidden className={cn("h-[42px] w-8 overflow-visible", className)} {...props}>
            <ellipse cx="16" cy="40.5" rx="6" ry="1.75" className="fill-foreground/20" />
            <path
                d="M16 1C7.7 1 1 7.6 1 15.8c0 10.6 12.6 22.3 14.1 23.7a1.3 1.3 0 0 0 1.8 0C18.4 38.1 31 26.4 31 15.8 31 7.6 24.3 1 16 1Z"
                className={PIN_TONE[tone]}
                strokeWidth="1.5"
            />
            <circle cx="16" cy="15.5" r="5.5" className="fill-card" />
        </svg>
    );
}

/** Navigation puck: a disc with a heading arrow, rotated to the direction of travel. */
export function PuckGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 36 36" aria-hidden className={cn("size-9 overflow-visible", className)} {...props}>
            <circle cx="18" cy="18" r="12" className="fill-card stroke-foreground/15" strokeWidth="1" />
            <path d="M18 9.5 24.5 25 18 21.4 11.5 25Z" className="fill-primary" strokeLinejoin="round" />
        </svg>
    );
}

/** Route origin: an ink pin, a size smaller than the destination's, anchored at its tip. */
export function OriginGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
    return <PinGlyph tone="ink" className={cn("h-[34px] w-[26px]", className)} {...props} />;
}

/** Stop on a multi-stop route: a small ringed dot, so many of them stay readable. */
export function StopGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4", className)} {...props}>
            <circle cx="8" cy="8" r="7" className="fill-card" />
            <circle cx="8" cy="8" r="4.5" className="fill-primary" />
        </svg>
    );
}

/** Stop with its position in the visiting order, for tours whose order matters. */
export function NumberedStop({ label, className }: { label: string; className?: string }) {
    return (
        <span
            className={cn(
                "flex size-[22px] items-center justify-center rounded-full bg-ink text-[12px] font-semibold leading-none tabular-nums text-ink-foreground shadow-[0_0_0_2px_hsl(var(--card))]",
                className,
            )}
        >
            {label}
        </span>
    );
}
