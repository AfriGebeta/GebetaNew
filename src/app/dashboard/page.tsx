"use client";

// @ts-nocheck
import React, {useContext, useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {getMatrix} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {StatCard, StatCardSkeleton} from "@/components/dashboard/stat-card";
import {Page as DashboardPage, PageIntro, Section} from "@/components/dashboard/page";
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
        { calltype: "TILE", total: 0, icon: <IconTrendingUp />, label: "Calls" },
        { calltype: "GEOCODING", total: 0, icon: <IconTrendingUp />, label: "Calls" },
        { calltype: "DIRECTION", total: 0, icon: <IconTrendingUp />, label: "Calls" },
        { calltype: "ONM", total: 0, icon: <IconTrendingUp />, label: "Calls" },
        { calltype: "MATRIX", total: 0, icon: <IconTrendingUp />, label: "Calls" },
        { calltype: "TSS", total: 0, icon: <IconTrendingUp />, label: "Calls" },
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
        <DashboardPage>
            <PageIntro
                title={`Welcome back${currentUser?.user?.username ? `, ${currentUser.user.username}` : ""}`}
                description="A snapshot of how your Gebeta Maps APIs are being used."
            />

            <UsageOverview currentUser={currentUser} />

            <Section title="Calls by API">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading
                        ? metrics.map((_, i) => <StatCardSkeleton key={i} />)
                        : metrics.map((metric, i) => (
                            <StatCard
                                key={i}
                                label={metric.calltype}
                                value={metric.total.toLocaleString()}
                                hint="Total calls"
                                badge={metric.label}
                                icon={metric.icon}
                            />
                        ))}
                </div>
            </Section>
        </DashboardPage>
    );
}
