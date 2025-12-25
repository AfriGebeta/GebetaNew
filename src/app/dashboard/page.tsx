"use client";

// @ts-nocheck
import React, {useContext, useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMatrix} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {MetricCard, MetricCardSkeleton} from "@/components/metric-card";
import UsageOverview from "@/app/dashboard/usage/UsageOverview";
import {IconTrendingUp} from "@tabler/icons-react";

export default function Page() {
    const { currentUser } = useContext(AuthContext);

    const { data, isLoading } = useQuery({
        queryKey: ["metrics", currentUser.token],
        queryFn: () => getMatrix(currentUser.token),
        staleTime: 5 * 60 * 1000,
    });

    const defaultMetrics = [
        { calltype: "TILE", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
        { calltype: "GEOCODING", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
        { calltype: "DIRECTION", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
        { calltype: "ONM", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
        { calltype: "MATRIX", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
        { calltype: "TSS", total: 0, icon: <IconTrendingUp className="size-4" />, label: "Calls" },
    ];

    const metrics = useMemo(() => {
        if (!data) return defaultMetrics;
        // @ts-ignore
        const map = data.reduce((acc, item) => {
            acc[item.calltype] = item.total;
            return acc;
        }, {});
        return defaultMetrics.map((metric) => ({
            ...metric,
            total: map[metric.calltype] || 0,
        }));
    }, [data]);

    return (
        <div className="w-full flex flex-col gap-6 mt-4">
            <UsageOverview currentUser={currentUser} />

            <div className="w-full px-4 lg:px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading
                    ? metrics.map((_, i) => <MetricCardSkeleton key={i} />)
                    : metrics.map((metric, i) => (
                        <MetricCard
                            key={i}
                            description={metric.calltype}
                            title={`${metric.total} calls`}
                            // footer="Across all call types"
                            badgeLabel={metric.label}
                            icon={metric.icon}
                        />
                    ))}
            </div>
        </div>
    );
}
