//@ts-nocheck
"use client";
import {getUserUsage} from "@/service/apis";
import {useQuery} from "@tanstack/react-query";
import {useContext, useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {AuthContext} from "@/providers/AuthProvider";

export default function Page() {
    const {currentUser} = useContext(AuthContext)

    const { data, isLoading } = useQuery({
        queryKey: ["metrics", currentUser.token],
        queryFn: () => getUserUsage(currentUser.token),
        staleTime: 5 * 60 * 1000,
    });


    console.log("metrics",data)

    const defaultMetrics = [
        { calltype: "TILE", total: 0 },
        { calltype: "GEOCODING", total: 0 },
        { calltype: "DIRECTION", total: 0 },
        { calltype: "ONM", total: 0 },
        { calltype: "MATRIX", total: 0 },
        { calltype: "TSS", total: 0 },
    ];

    const mergedMetrics = useMemo(() => {
        if (!data) return defaultMetrics;

        const metricsMap = data.reduce((acc, item) => {
            acc[item.calltype] = item.total;
            return acc;
        }, {});

        return defaultMetrics.map((metric) => ({
            calltype: metric.calltype,
            total: metricsMap[metric.calltype] || 0,
        }));
    }, [data]);

    const SkeletonItem = () => (
        <Card className="animate-pulse">
            <CardHeader>
                <CardTitle className="bg-gray-700 h-4 w-3/4 mb-2 rounded"></CardTitle>
                <CardContent className="bg-gray-700 h-4 w-1/2 rounded"></CardContent>
            </CardHeader>
        </Card>
    );

    return (
        <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array(5)
                        .fill(0)
                        .map((_, i) => <SkeletonItem />)
                ) : (
                    mergedMetrics.map((data, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{data.calltype}</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <h3 className="whitespace-nowrap text-sm font-bold">{data.total} calls</h3>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
