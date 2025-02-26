//@ts-nocheck
import React, {useEffect, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {KeyIcon} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {getUserUsage} from "@/service/apis";
import SkeletonItem from "@/app/_component/SkeletonItem";


interface UsageOverviewProps {
    currentUser: any
}

export default function UsageOverview({currentUser}: UsageOverviewProps) {

    const [purchasedPlans, setPurchasedPlans] = useState('');

    const {data, isLoading} = useQuery({
        queryKey: ["metrics", currentUser.token],
        queryFn: () => getUserUsage(currentUser.token),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (currentUser?.user?.token) {
            setPurchasedPlans("Credits");
        }
        if (currentUser?.user?.purchased_date != null) {
            setPurchasedPlans("Pay as you go");
        }
    }, [currentUser]);


    const getTotal = () => {
        if (!data || data.length === 0) return 0;
        return data.reduce((acc, item) => acc + item.total, 0);
    };

    const getMaximum = () => {
        if (!data || data.length === 0) return "0";
        const maxValue = Math.max(...data.map(metric => metric.total));
        const maxMessage = data.find(item => item.total === maxValue)?.calltype;
        return `${maxValue} ${capitalize(maxMessage)}`;
    };

    const getMinimum = () => {
        if (!data || data.length === 0) return "0";
        const minValue = Math.min(...data.map(metric => metric.total));
        const minMessage = data.find(item => item.total === minValue)?.calltype;
        return `${minValue} ${capitalize(minMessage)}`;
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
                [...Array(4)].map((_, index) => <SkeletonItem key={index}/>)
            ) : (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">API Token Status</CardTitle>
                            <KeyIcon className="w-4 h-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                                    <span
                                        className={`${currentUser?.user?.token ? "text-green-500" : "text-red-500"} text-sm font-bold`}>
                                        {currentUser?.user?.token ? "Active" : "Inactive"}
                                    </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold">{purchasedPlans}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
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
                            <h3 className="text-sm font-bold">{getTotal()} calls</h3>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Max Usage</CardTitle>
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
                            <h3 className="whitespace-nowrap text-sm font-bold">{getMaximum()} calls</h3>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Min Usage</CardTitle>
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
                            <h3 className="whitespace-nowrap text-sm font-bold">{getMinimum()} calls</h3>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
