// @ts-nocheck

"use client";

import React, {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMatrix} from "@/service/apis";
import {IconPackage, IconTrendingDown, IconTrendingUp,} from "@tabler/icons-react";

import {StatCard, StatCardSkeleton} from "@/components/dashboard/stat-card";

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
            label: "Total Usage",
            value: totalUsage.toLocaleString(),
            hint: "Across all call types",
            badge: "Calls",
            icon: <IconTrendingUp />,
        },
        {
            label: "Subscription",
            value: purchasedPlans || "Free",
            hint: "Current billing model",
            badge: "Plan",
            icon: <IconPackage />,
        },
        {
            label: "Max Usage",
            value: maxUsage,
            hint: "Highest call volume",
            badge: "Peak",
            icon: <IconTrendingUp />,
        },
        {
            label: "Min Usage",
            value: minUsage,
            hint: "Lowest call volume",
            badge: "Lowest",
            icon: <IconTrendingDown />,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
                ? cards.map((_, i) => <StatCardSkeleton key={i} />)
                : cards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
        </div>
    );
}
