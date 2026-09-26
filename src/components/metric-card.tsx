import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { GeistPixelSquare } from "geist/font/pixel";

type MetricCardProps = {
    description: string;
    title: React.ReactNode;
    footer?: string;
    badgeLabel: string;
    icon: React.ReactNode;
};

export function MetricCard({
    description,
    title,
    footer,
    badgeLabel,
    icon,
}: MetricCardProps) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription className="font-mono">{description}</CardDescription>

                <CardTitle className="tabular-nums">
                    {title}
                </CardTitle>

                <CardAction>
                    <Badge variant="outline">
                        <span className="mr-2">{icon}</span>
                        {badgeLabel}
                    </Badge>
                </CardAction>
            </CardHeader>

            {footer && <CardFooter className="text-sm text-muted-foreground">
                {footer}
            </CardFooter>}
        </Card>
    );
}

function Skeleton({ className }: { className: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-muted ${className}`} />
    );
}

export function MetricCardSkeleton() {
    return (
        <Card className="@container/card h-[120px]">
            <CardHeader>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-6 w-20" />
            </CardHeader>
        </Card>
    );
}
