import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

const PIN_TONE = {
    primary: "fill-primary stroke-primary-foreground/25",
    ink: "fill-ink stroke-card",
};

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

export function OriginGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
    return <PinGlyph tone="ink" className={cn("h-[34px] w-[26px]", className)} {...props} />;
}

export function StopGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4", className)} {...props}>
            <circle cx="8" cy="8" r="7" className="fill-card" />
            <circle cx="8" cy="8" r="4.5" className="fill-primary" />
        </svg>
    );
}

const asset = (file: string) => `/assets/markers/${encodeURIComponent(file)}`;

/** The marker images in public/assets/markers, shown below their native size so they stay sharp on dense screens. */
export const MARKER_ASSETS = {
    navigation: { src: asset("Map pin (5).png"), width: 36, height: 36 },
    stop: { src: asset("Map pin (2).png"), width: 35, height: 40 },
    depot: { src: asset("Map pin.png"), width: 32, height: 42 },
};

export function AssetMarker({ kind, className }: { kind: keyof typeof MARKER_ASSETS; className?: string }) {
    const { src, width, height } = MARKER_ASSETS[kind];
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={width} height={height} draggable={false} className={cn("block select-none", className)} />;
}
