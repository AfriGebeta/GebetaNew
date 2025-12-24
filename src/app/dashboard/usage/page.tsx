// @ts-nocheck
"use client";

import {useContext, useEffect, useMemo, useState} from "react";
import {getUserUsage, getUserUsageForGraph} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {CalendarIcon} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {MetricCard, MetricCardSkeleton} from "@/components/metric-card";
import APIUsage from "./APIUsage";
import {Icons} from "@/components/icons";

export default function Usage() {
    const { currentUser } = useContext(AuthContext);
    const [graphData, setGraphData] = useState({ error: "no data" });

    const date = new Date();
    const currentDate = date.toJSON().slice(0, 10);
    const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toJSON().slice(0, 10);

    const [startingDate, setStartingDate] = useState(thirtyDaysAgo);
    const [endingDate, setEndingDate] = useState(currentDate);
    const [selected, setSelected] = useState("All");
    const [loading, setLoading] = useState(false);

    const { data: usageData, isLoading: usageLoading } = useQuery({
        queryKey: ["usage", currentUser.token, selected, startingDate, endingDate],
        queryFn: () => getUserUsage(startingDate, endingDate, currentUser.token),
        staleTime: 5 * 60 * 1000,
    });

    const defaultMetrics = [
        { calltype: "TILE", total: 0, icon: <Icons.gebeta className="h-6 w-6" />, label: "Calls" },
        { calltype: "GEOCODING", total: 0, icon: <Icons.mapPin className="h-6 w-6" />, label: "Calls" },
        { calltype: "DIRECTION", total: 0, icon: <Icons.direction className="h-6 w-6" />, label: "Calls" },
        { calltype: "ONM", total: 0, icon: <Icons.matrix className="h-6 w-6" />, label: "Calls" },
        { calltype: "MATRIX", total: 0, icon: <Icons.matrix className="h-6 w-6" />, label: "Calls" },
        { calltype: "TSS", total: 0, icon: <Icons.navigation className="h-6 w-6" />, label: "Calls" },
    ];

    const mergedMetrics = useMemo(() => {
        if (!usageData) return defaultMetrics;

        const metricsMap = {};
        usageData.forEach((item) => {
            metricsMap[item.calltype] = (metricsMap[item.calltype] || 0) + item.total;
        });

        return defaultMetrics.map((metric) => ({
            ...metric,
            total: metricsMap[metric.calltype] || 0,
        }));
    }, [usageData]);

    const totalCalls = useMemo(() => mergedMetrics.reduce((sum, metric) => sum + metric.total, 0), [mergedMetrics]);

    const getGraphData = async () => {
        setLoading(true);
        if (startingDate && endingDate) {
            try {
                const response = await getUserUsageForGraph(selected.toUpperCase(), startingDate, endingDate, currentUser.token);
                if (!response.error) setGraphData(response);
            } catch (error) {
                console.error("Error fetching graph data:", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (startingDate && endingDate) getGraphData();
    }, [startingDate, endingDate, selected]);

    const handleStartChange = (date) => setStartingDate(date ? format(date, "yyyy-MM-dd") : thirtyDaysAgo);
    const handleEndChange = (date) => setEndingDate(date ? format(date, "yyyy-MM-dd") : currentDate);
    const handleChange = (value) => setSelected(value);

    // Add Total card
    const cards = [
        ...mergedMetrics.map((metric) => ({
            description: metric.calltype,
            title: `${metric.total} ${metric.label}`,
            icon: metric.icon,
        })),
        {
            description: "Total",
            title: `${totalCalls} Calls`,
            icon: <Icons.gebeta className="h-6 w-6" />,
        },
    ];

    return (
        <div className="flex flex-col px-8 py-6 rounded-md gap-6">
            <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usageLoading
                    ? cards.map((_, i) => <MetricCardSkeleton key={i} />)
                    : cards.map((card, i) => <MetricCard key={i} {...card} />)}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <p>Select endpoints:</p>
                    <Select onValueChange={handleChange} defaultValue="All">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select endpoint" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="TILE">Tile</SelectItem>
                                <SelectItem value="GEOCODING">Geocoding</SelectItem>
                                <SelectItem value="DIRECTION">Direction</SelectItem>
                                <SelectItem value="MATRIX">Matrix</SelectItem>
                                <SelectItem value="ONM">ONM</SelectItem>
                                <SelectItem value="TSS">TSS</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4">
                    <p>From</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !startingDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startingDate ? format(new Date(startingDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={new Date(startingDate)} onSelect={handleStartChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-4">
                    <p>To</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !endingDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endingDate ? format(new Date(endingDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={new Date(endingDate)} onSelect={handleEndChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* API Usage Chart */}
            <APIUsage graphData={graphData} isLoading={loading} />
        </div>
    );
}
