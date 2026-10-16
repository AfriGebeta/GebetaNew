"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { rise } from "@/lib/motion";
import { BENTO } from "@/constants/landing";
import { productHref } from "@/constants/products";
import { Card } from "@/components/ui/card";
import { DirectionsDemo, GeocodingDemo, MatrixDemo, OptimizationDemo, SdkDemo, TilesDemo } from "./demos";

type TileCopy = { title: string; body: string; href: string; cta?: string };

/** Shared frame: the demo on top, the claim underneath. */
function Tile({ copy, children, className, demoClassName }: { copy: TileCopy; children: ReactNode; className?: string; demoClassName?: string }) {
    const external = copy.href.startsWith("http");
    return (
        <motion.div variants={rise} className={cn("flex", className)}>
            <Card className="group flex w-full flex-col overflow-hidden">
                <div className={cn("relative min-h-[220px] flex-1 overflow-hidden bg-raised", demoClassName)}>{children}</div>
                <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-[17px] font-medium leading-[1.25] text-foreground">{copy.title}</h3>
                    <p className="text-[15px] leading-[1.5] text-soft">{copy.body}</p>
                    <Link
                        href={copy.href}
                        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                        className="mt-1 inline-flex w-fit items-center gap-1 text-[14px] font-medium text-foreground outline-none hover:text-soft focus-visible:text-soft"
                    >
                        {copy.cta ?? "Learn more"}
                        <ArrowRight aria-hidden className="size-3.5 transition-transform duration-150 ease-power3-out group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </Card>
        </motion.div>
    );
}

const t = BENTO.tiles;

export function TilesTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.tiles, href: productHref("maps") }} className={className} demoClassName="min-h-[360px]">
            <TilesDemo />
        </Tile>
    );
}

export function GeocodingTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.geocoding, href: productHref("geocoding") }} className={className}>
            <GeocodingDemo />
        </Tile>
    );
}

export function DirectionsTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.directions, href: productHref("directions") }} className={className}>
            <DirectionsDemo />
        </Tile>
    );
}

export function MatrixTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.matrix, href: productHref("matrix") }} className={className}>
            <MatrixDemo />
        </Tile>
    );
}

export function OptimizationTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.optimization, href: productHref("route-optimization") }} className={className} demoClassName="min-h-[320px]">
            <OptimizationDemo />
        </Tile>
    );
}

export function SdkTile({ className }: { className?: string }) {
    return (
        <Tile copy={{ ...t.sdk, cta: "SDK reference" }} className={className}>
            <SdkDemo />
        </Tile>
    );
}
