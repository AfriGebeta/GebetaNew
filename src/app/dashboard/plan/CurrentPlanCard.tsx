"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SegmentBar from "@/components/ui/segment-bar";
import {
    type CurrentPlan,
    PLAN_LABEL,
    formatCallType,
    getCreditUsage,
    parseExpiration,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";
import Link from "next/link";

type CurrentPlanCardProps = {
    plan: CurrentPlan;
    bundleName?: string;
};

// const TAG_TONE = { paid: "green", payg: "blue", free: "neutral", none: "neutral" } as const;

function formatExpiration(expiration?: string) {
    return parseExpiration(expiration)?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CurrentPlanCard({ plan, bundleName }: CurrentPlanCardProps) {
    const { kind, credit } = plan;
    const usage = credit ? getCreditUsage(credit) : [];
    const expires = formatExpiration(credit?.expiration);

    const title = kind === "paid" ? bundleName || "Paid plan" : PLAN_LABEL[kind];
    const description = {
        paid: expires ? `Credits valid until ${expires}.` : "Your purchased credit bundle.",
        payg: credit
            ? `Billed by usage. Your remaining credits${expires ? ` (valid until ${expires})` : ""} are listed below.`
            : "Billed by usage, with tiered pricing per API.",
        free: expires ? `Free credits valid until ${expires}.` : "Your free credits.",
        none: "You have no active credits. Pick a plan below to keep making calls.",
    }[kind];

    return (
        <Card className="gap-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[18px] font-medium text-foreground">{title}</h3>
                        {/* <Tag tone={TAG_TONE[kind]}>{PLAN_LABEL[kind]}</Tag> */}
                    </div>
                    <p className="caption-style leading-[1.4] text-soft">{description}</p>
                </div>
                {kind === "payg" && (
                    <Button variant="secondary" size="md" asChild>
                        <Link href="/dashboard/billing">View billing</Link>
                    </Button>
                )}
            </div>

            {usage.length > 0 && (
                <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    {usage.map(({ callType, used, cap, remaining, percent }) => (
                        <li key={callType} className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-[14px] font-medium text-foreground">
                                    {formatCallType(callType)}
                                    {callType === "TILE" && <span className="font-normal text-subtle"> (daily limit)</span>}
                                </span>
                                <span className="caption-style tabular-nums text-subtle">
                                    <span className="text-foreground">{used.toLocaleString()}</span> / {cap.toLocaleString()}
                                </span>
                            </div>
                            <SegmentBar
                                percent={percent}
                                segments={32}
                                tone={percent >= 90 ? "danger" : percent >= 75 ? "warning" : "success"}
                            />
                            <span className={cn("caption-style tabular-nums", remaining === 0 ? "text-danger" : "text-subtle")}>
                                {remaining === 0 ? "No calls left" : `${remaining.toLocaleString()} left`}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
