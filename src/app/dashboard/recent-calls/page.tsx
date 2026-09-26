//@ts-nocheck
"use client"
import React, { useContext, useEffect, useState } from "react";
import { getRecentCalls } from "@/service/apis";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CALL_TYPES = [
    { value: "GEOCODING", label: "Geocoding" },
    { value: "REVERSEGEOCODING", label: "Reverse Geocoding" },
    { value: "DIRECTION", label: "Direction" },
    { value: "ONM", label: "ONM" },
    { value: "MATRIX", label: "Matrix" },
    { value: "TSS", label: "TSS" },
    { value: "TILE", label: "Tile" },
    { value: "VRP", label: "VRP" },
];

export default function RecentCalls() {
    const { currentUser } = useContext(AuthContext);
    const { toast } = useToast();

    const date = new Date();
    const currentDate = format(date, "yyyy-MM-dd");
    const sevenDaysAgo = format(new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

    const [startDate, setStartDate] = useState(sevenDaysAgo);
    const [endDate, setEndDate] = useState(currentDate);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [type, setType] = useState("ALL");
    const [ipAddress, setIpAddress] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [debouncedIpAddress, setDebouncedIpAddress] = useState("");
    const [debouncedDeviceId, setDebouncedDeviceId] = useState("");
    const [calls, setCalls] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedIpAddress(ipAddress);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [ipAddress]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDeviceId(deviceId);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [deviceId]);

    const fetchCalls = async () => {
        if (!currentUser?.token) return;
        setIsLoading(true);
        try {
            const response = await getRecentCalls(currentUser.token, {
                startDate,
                endDate,
                page,
                pageSize,
                type: type !== "ALL" ? type : undefined,
                ipAddress: debouncedIpAddress || undefined,
                deviceId: debouncedDeviceId || undefined,
            });

            if (response.success) {
                setCalls(Array.isArray(response.data) ? response.data : []);
                setTotalCount(response.totalCount || 0);
            } else {
                toast({
                    description: response.message || "Failed to fetch recent calls",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Failed to fetch recent calls:", error);
            toast({
                description: "Failed to fetch recent calls",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.token) {
            fetchCalls();
        }
    }, [currentUser?.token, startDate, endDate, page, type, debouncedIpAddress, debouncedDeviceId]);

    const handleClearFilters = () => {
        setType("ALL");
        setIpAddress("");
        setDeviceId("");
        setPage(1);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-4 rounded-lg min-h-[60vh]">
            <div className="mb-6">
                <h2 className="text-xl text-white font-semibold mb-2">Recent API Calls</h2>
                <p className="text-sm text-[#aaa]">
                    View and filter your recent API calls with detailed information about each request.
                </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate ? new Date(startDate + "T00:00:00") : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        setStartDate(format(date, "yyyy-MM-dd"));
                                        setPage(1);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-1">
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[200px] justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(new Date(endDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate ? new Date(endDate + "T00:00:00") : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        setEndDate(format(date, "yyyy-MM-dd"));
                                        setPage(1);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <FilterIcon className="h-4 w-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
            </div>

            {showFilters && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="type-filter">Call Type</Label>
                            <Select value={type} onValueChange={(val) => { setType(val); setPage(1); }}>
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All types</SelectItem>
                                    {CALL_TYPES.map((callType) => (
                                        <SelectItem key={callType.value} value={callType.value}>
                                            {callType.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="ip-filter">IP Address</Label>
                            <Input
                                id="ip-filter"
                                placeholder="e.g., 192.168.1.1"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="device-filter">Device ID</Label>
                            <Input
                                id="device-filter"
                                placeholder="Filter by device"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="gap-2"
                    >
                        <XIcon className="h-4 w-4" />
                        Clear Filters
                    </Button>
                </div>
            )}

            {isLoading ? (
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Request URL</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Latency</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(10)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : calls.length > 0 ? (
                <>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Request URL</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Latency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {calls.map((call, index) => (
                                    <TableRow key={call.id || index}>
                                        <TableCell className="font-medium">{call.call_type || "N/A"}</TableCell>
                                        <TableCell className="font-mono text-xs max-w-xs truncate" title={call.request_url}>
                                            {call.request_url || "N/A"}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{call.ip_address || "N/A"}</TableCell>
                                        <TableCell className="font-mono text-xs">{call.device_fingerprint || "-"}</TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs",
                                                call.status === "success" || call.status === "SUCCESS"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            )}>
                                                {call.status || "N/A"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">{formatDateTime(call.created_at)}</TableCell>
                                        <TableCell className="text-sm">{call.latency ? `${call.latency}ms` : "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                        <Button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="bg-[#FFA500] px-4 py-2 rounded-md hover:bg-[#FF8C00]"
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-[#aaa]">
                            <span>Page {page}</span>
                            {totalCount > 0 && (
                                <span className="ml-2">• Total: {totalCount.toLocaleString()} calls</span>
                            )}
                        </div>
                        <Button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={calls.length < pageSize}
                            className="bg-[#FFA500] px-4 py-2 rounded-md hover:bg-[#FF8C00]"
                        >
                            Next
                        </Button>
                    </div>
                </>
            ) : (
                <div className="h-[350px] flex flex-col justify-center gap-4 items-center border border-dashed rounded-lg">
                    <p className="text-[#aaa]">No recent calls found</p>
                    <p className="text-xs text-[#aaa]">Try adjusting your filters or date range</p>
                </div>
            )}
        </div>
    );
}
