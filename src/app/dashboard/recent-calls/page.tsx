//@ts-nocheck
"use client"
import React, { useContext, useEffect, useState } from "react";
import { getRecentCalls } from "@/service/apis";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Field from "@/components/ui/field";
import Tag from "@/components/ui/tag";
import DatePicker from "@/components/ui/date-picker";
import { EmptyState, Page, PageIntro } from "@/components/dashboard/page";
import { AuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FilterIcon, History, XIcon } from "lucide-react";
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

    const header = (
        <TableHeader>
            <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Request URL</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Latency</TableHead>
            </TableRow>
        </TableHeader>
    );

    return (
        <Page>
            <PageIntro
                title="Recent API Calls"
                description="View and filter your recent API calls with detailed information about each request."
            />

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end gap-3">
                    <Field label="Start date" htmlFor="start-date">
                        <DatePicker
                            id="start-date"
                            value={startDate}
                            onChange={(value) => { setStartDate(value); setPage(1); }}
                        />
                    </Field>
                    <Field label="End date" htmlFor="end-date">
                        <DatePicker
                            id="end-date"
                            value={endDate}
                            onChange={(value) => { setEndDate(value); setPage(1); }}
                        />
                    </Field>
                    <Button
                        variant={showFilters ? "muted" : "secondary"}
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        className="mb-[3px]"
                    >
                        <FilterIcon aria-hidden />
                        {showFilters ? "Hide filters" : "More filters"}
                    </Button>
                </div>

                {showFilters && (
                    <div className="flex flex-col gap-4 rounded-lg bg-card p-4 shadow-card">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Field label="Call type" htmlFor="type-filter">
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
                            </Field>
                            <Field label="IP address" htmlFor="ip-filter">
                                <Input
                                    id="ip-filter"
                                    placeholder="e.g. 192.168.1.1"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                />
                            </Field>
                            <Field label="Device ID" htmlFor="device-filter">
                                <Input
                                    id="device-filter"
                                    placeholder="Filter by device"
                                    value={deviceId}
                                    onChange={(e) => setDeviceId(e.target.value)}
                                />
                            </Field>
                        </div>
                        <div>
                            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                <XIcon aria-hidden />
                                Clear filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <TableContainer>
                    <Table>
                        {header}
                        <TableBody>
                            {[...Array(10)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-3 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-3 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-3 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-3 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-[22px] w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-3 w-32" /></TableCell>
                                    <TableCell><Skeleton className="ml-auto h-3 w-12" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : calls.length > 0 ? (
                <div className="flex flex-col gap-4">
                    <TableContainer>
                        <Table>
                            {header}
                            <TableBody>
                                {calls.map((call, index) => {
                                    const ok = call.status === "success" || call.status === "SUCCESS";
                                    return (
                                        <TableRow key={call.id || index}>
                                            <TableCell className="font-medium">{call.call_type || "N/A"}</TableCell>
                                            <TableCell className="max-w-xs truncate font-mono text-[12px] text-soft" title={call.request_url}>
                                                {call.request_url || "N/A"}
                                            </TableCell>
                                            <TableCell className="font-mono text-[12px] text-soft">{call.ip_address || "N/A"}</TableCell>
                                            <TableCell className="font-mono text-[12px] text-soft">{call.device_fingerprint || "—"}</TableCell>
                                            <TableCell>
                                                <Tag size="sm" tone={ok ? "green" : "red"}>{call.status || "N/A"}</Tag>
                                            </TableCell>
                                            <TableCell className="tabular-nums text-soft">{formatDateTime(call.created_at)}</TableCell>
                                            <TableCell className="text-right tabular-nums text-soft">{call.latency ? `${call.latency}ms` : "—"}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div className="flex items-center justify-between gap-2">
                        <span className="caption-style text-subtle">
                            Page {page}
                            {totalCount > 0 && ` · ${totalCount.toLocaleString()} calls`}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft aria-hidden /> Previous
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={calls.length < pageSize}
                            >
                                Next <ChevronRight aria-hidden />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<History />}
                    title="No recent calls found"
                    description="Try adjusting your filters or date range."
                    className="min-h-[300px]"
                />
            )}
        </Page>
    );
}
