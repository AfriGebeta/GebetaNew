//@ts-nocheck
"use client";
import {useQuery} from "@tanstack/react-query";
import {useContext, useEffect, useState} from "react";
import {getUserUsage, getUserUsageForGraph} from "@/service/apis";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import APIUsage from "./APIUsage";
import {CalendarIcon, KeyIcon} from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

export default function Usage() {
    const { currentUser } = useContext(AuthContext);
    const [purchasedPlans, setPurchasedPlans] = useState('');
    const [graphData, setGraphData] = useState({ error: "no data" });

    const date = new Date();
    const currentDate = date.toJSON().slice(0, 10);

    const thirtyDaysAgoInMillis = date.getTime() - (30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(thirtyDaysAgoInMillis).toJSON().slice(0, 10);

    const [startingDate, setStartingDate] = useState(thirtyDaysAgo);
    const [endingDate, setEndingDate] = useState(currentDate);
    const [selected, setSelected] = useState("All");
    const [loading, setLoading] = useState(false);

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

    const { data, isLoading } = useQuery({
        queryKey: ['metrics'],
        queryFn: () => getUserUsage(currentUser.token),
        staleTime: 5 * 60 * 1000
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        [...Array(4)].map((_, index) => <SkeletonItem key={index} />)
                    ) : (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">API Token Status</CardTitle>
                                    <KeyIcon className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <span className={`${currentUser?.user?.token ? "text-green-500" : "text-red-500"} text-sm font-bold`}>
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
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="whitespace-nowrap text-sm font-bold">{getMinimum()} calls</h3>
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
                                <SelectValue placeholder="Select endpoint" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="All">All</SelectItem>
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
                                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                <APIUsage graphData={graphData} isLoading={loading} />
            </div>
        </div>
    );
}