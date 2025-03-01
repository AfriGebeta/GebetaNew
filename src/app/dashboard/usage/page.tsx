//@ts-nocheck
"use client";
import {useContext, useEffect, useMemo, useState} from "react";
import {getUserUsage, getUserUsageForGraph} from "@/service/apis";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import APIUsage from "./APIUsage";
import {CalendarIcon} from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import SkeletonItem from "@/app/_component/SkeletonItem";
import {useQuery} from "@tanstack/react-query";

export default function Usage() {
    const {currentUser} = useContext(AuthContext);
    const [graphData, setGraphData] = useState({error: "no data"});

    const date = new Date();
    const currentDate = date.toJSON().slice(0, 10);

    const thirtyDaysAgoInMillis = date.getTime() - (30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(thirtyDaysAgoInMillis).toJSON().slice(0, 10);

    const [startingDate, setStartingDate] = useState(thirtyDaysAgo);
    const [endingDate, setEndingDate] = useState(currentDate);
    const [selected, setSelected] = useState("All");
    const [loading, setLoading] = useState(false);

    const {data: usageData, isLoading: usageLoading} = useQuery({
        queryKey: ["usage", currentUser.token, selected, startingDate, endingDate],
        queryFn: () => getUserUsage(startingDate, endingDate, currentUser.token),
        staleTime: 5 * 60 * 1000,
    });

    console.log("usageData", usageData)

    const defaultMetrics = [
        {calltype: "TILE", total: 0},
        {calltype: "GEOCODING", total: 0},
        {calltype: "DIRECTION", total: 0},
        {calltype: "ONM", total: 0},
        {calltype: "MATRIX", total: 0},
        {calltype: "TSS", total: 0},
    ];

    const mergedMetrics = useMemo(() => {
        if (!usageData || !usageData) return defaultMetrics;

        const metricsMap = {};

        usageData?.forEach(item => {
            if (!metricsMap[item.calltype]) {
                metricsMap[item.calltype] = 0;
            }
            metricsMap[item.calltype] += item.total;
        });


        return defaultMetrics.map((metric) => ({
            calltype: metric.calltype,
            total: metricsMap[metric.calltype] || 0,
        }));
    }, [usageData]);

    const totalCalls = useMemo(() => {
        return mergedMetrics.reduce((sum, metric) => sum + metric.total, 0);
    }, [mergedMetrics]);

    function handleEndChange(date) {
        setEndingDate(date ? format(date, "yyyy-MM-dd") : currentDate);
    }

    function handleStaringChange(date) {
        setStartingDate(date ? format(date, "yyyy-MM-dd") : thirtyDaysAgo);
    }

    function handleChange(value) {
        setSelected(value);
    }

    const getGraphData = async () => {
        setLoading(true);
        if (startingDate && endingDate) {
            try {
                const response = await getUserUsageForGraph(selected.toUpperCase(), startingDate, endingDate, currentUser.token);
                if (response.error == null) {
                    setGraphData(response);
                }
            } catch (error) {
                console.error("Error fetching graph data:", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (startingDate && endingDate) {
            getGraphData();
        }
    }, [startingDate, endingDate, selected]);


    const SkeletonItem = () => (
        <Card className="animate-pulse">
            <CardHeader>
                <CardTitle className="bg-gray-700 h-4 w-3/4 mb-2 rounded"></CardTitle>
                <CardContent className="bg-gray-700 h-4 w-1/2 rounded"></CardContent>
            </CardHeader>
        </Card>
    );

    return (
        <div>
            <div className="flex flex-col px-8 py-6 rounded-md">
                <div className="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {usageLoading ? (
                        Array(5)
                            .fill(0)
                            .map((_, i) => <SkeletonItem key={i}/>)
                    ) : (
                        <>
                            {mergedMetrics.map((data, i) => (
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
                            ))}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total</CardTitle>
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
                                    <h3 className="whitespace-nowrap text-sm font-bold">{totalCalls} calls</h3>
                                </CardContent>
                            </Card>

                        </>

                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center mt-[40px] gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <p>Select endpoints:</p>
                        <Select onValueChange={handleChange} defaultValue="All">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select endpoint"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="TILE">Tile</SelectItem>
                                    <SelectItem value="Geocoding">Geocoding</SelectItem>
                                    <SelectItem value="Direction">Direction</SelectItem>
                                    <SelectItem value="Matrix">Matrix</SelectItem>
                                    <SelectItem value="ONM">Onm</SelectItem>
                                    <SelectItem value="TSS">TSS</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <p>from</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !startingDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {startingDate ? format(new Date(startingDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={new Date(startingDate)}
                                    onSelect={handleStaringChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                        <p>to</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !endingDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {endingDate ? format(new Date(endingDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={new Date(endingDate)}
                                    onSelect={handleEndChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <APIUsage graphData={graphData} isLoading={loading}/>
            </div>
        </div>
    );
}