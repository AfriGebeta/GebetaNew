"use client";

// @ts-nocheck
import React, {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMatrix} from "@/service/apis";
import {IconPackage, IconTrendingDown, IconTrendingUp,} from "@tabler/icons-react";

import {MetricCard, MetricCardSkeleton} from "@/components/metric-card";

interface UsageOverviewProps {
    currentUser: any;
}

export default function UsageOverview({ currentUser }: UsageOverviewProps) {
    const [purchasedPlans, setPurchasedPlans] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["metrics", currentUser.token],
        queryFn: () => getMatrix(currentUser.token),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (currentUser?.user?.token) setPurchasedPlans("Credits");
        if (currentUser?.user?.purchased_date != null)
            setPurchasedPlans("Pay as you go");
    }, [currentUser]);

    const capitalize = (str: string) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

    const totalUsage =
        data?.reduce((acc, item) => acc + item.total, 0) ?? 0;

    const maxUsage = (() => {
        if (!data?.length) return "0";
        const max = Math.max(...data.map((m) => m.total));
        const type = data.find((m) => m.total === max)?.calltype;
        return `${max} ${capitalize(type)}`;
    })();

    const minUsage = (() => {
        if (!data?.length) return "0";
        const min = Math.min(...data.map((m) => m.total));
        const type = data.find((m) => m.total === min)?.calltype;
        return `${min} ${capitalize(type)}`;
    })();

    const cards = [
        {
            description: "Total Usage",
            title: totalUsage,
            footer: "Across all call types",
            badgeLabel: "Calls",
            icon: <IconTrendingUp className="size-4" />,
        },
        {
            description: "Subscription",
            title: purchasedPlans,
            footer: "Current billing model",
            badgeLabel: "Plan",
            icon: <IconPackage className="size-4" />,
        },
        {
            description: "Max Usage",
            title: maxUsage,
            footer: "Highest call volume",
            badgeLabel: "Peak",
            icon: <IconTrendingUp className="size-4" />,
        },
        {
            description: "Min Usage",
            title: minUsage,
            footer: "Lowest call volume",
            badgeLabel: "Lowest",
            icon: <IconTrendingDown className="size-4" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-4">
            {isLoading
                ? cards.map((_, i) => <MetricCardSkeleton key={i} />)
                : cards.map((card, i) => (
                    <MetricCard key={i} {...card} />
                ))}
        </div>
    );
}
