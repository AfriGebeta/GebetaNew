// @ts-nocheck
"use client";

import {useContext, useEffect, useMemo, useState} from "react";
import {
    getUserUsage,
    getUserUsageForGraph,
    getUsageQuotas,
    createUsageQuota,
    updateUsageQuota,
    deleteUsageQuota,
} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon, Check, ChevronDown, PencilIcon, PlusIcon, ShieldAlertIcon, Trash2Icon} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {MetricCard, MetricCardSkeleton} from "@/components/metric-card";
import APIUsage from "./APIUsage";
import {Icons} from "@/components/icons";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useToast} from "@/hooks/use-toast";

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

const DURATIONS = ["Daily", "Weekly", "Monthly"];

const QUOTA_CALL_TYPES = [
    { value: "GEOCODING", label: "Geocoding" },
    { value: "REVERSEGEOCODING", label: "Reverse Geocoding" },
    { value: "DIRECTION", label: "Direction" },
    { value: "ONM", label: "ONM" },
    { value: "MATRIX", label: "Matrix" },
    { value: "TSS", label: "TSS" },
    { value: "TILE", label: "Tile" },
    { value: "VRP", label: "VRP" },
];

export default function Usage() {
    const { currentUser } = useContext(AuthContext);
    const { toast } = useToast();
    const [graphData, setGraphData] = useState({ error: "no data" });

    const date = new Date();
    const currentDate = date.toJSON().slice(0, 10);
    const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toJSON().slice(0, 10);

    const [startingDate, setStartingDate] = useState(thirtyDaysAgo);
    const [endingDate, setEndingDate] = useState(currentDate);
    const [selectedTypes, setSelectedTypes] = useState(CALL_TYPES.map(t => t.value));
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    //for usage quota states
    const [quotas, setQuotas] = useState([]);
    const [quotasLoading, setQuotasLoading] = useState(false);
    const [quotaDialogOpen, setQuotaDialogOpen] = useState(false);
    const [editQuotaDialogOpen, setEditQuotaDialogOpen] = useState(false);
    const [quotaForm, setQuotaForm] = useState({ call_type: "", duration: "Monthly", max_calls: "", next_reset_at: "" });
    const [editQuotaForm, setEditQuotaForm] = useState({ id: "", max_calls: "" });
    const [isSubmittingQuota, setIsSubmittingQuota] = useState(false);
    const [isUpdatingQuota, setIsUpdatingQuota] = useState(false);
    const [isDeletingQuotaId, setIsDeletingQuotaId] = useState(null);

    const fetchQuotas = async () => {
        setQuotasLoading(true);
        const result = await getUsageQuotas(currentUser?.token);
        if (Array.isArray(result)) setQuotas(result);
        setQuotasLoading(false);
    };

    const { data: usageData, isLoading: usageLoading } = useQuery({
        queryKey: ["usage", currentUser.token, selectedTypes, startingDate, endingDate],
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
        if (!usageData || !Array.isArray(usageData)) return defaultMetrics;

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
        if (startingDate && endingDate && selectedTypes.length > 0) {
            try {
                const typesParam = selectedTypes.join(',');
                const response = await getUserUsageForGraph(typesParam, startingDate, endingDate, currentUser.token);
                if (!response.error) setGraphData(response);
            } catch (error) {
                console.error("Error fetching graph data:", error);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (startingDate && endingDate && selectedTypes.length > 0) getGraphData();
    }, [startingDate, endingDate, selectedTypes]);

    useEffect(() => {
        fetchQuotas();
    }, []);

    const handleStartChange = (date) => setStartingDate(date ? format(date, "yyyy-MM-dd") : thirtyDaysAgo);
    const handleEndChange = (date) => setEndingDate(date ? format(date, "yyyy-MM-dd") : currentDate);

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleCreateQuota = async () => {
        if (!quotaForm.call_type) {
            toast({ description: "Please select an endpoint", variant: "destructive" });
            return;
        }
        if (!quotaForm.max_calls || Number(quotaForm.max_calls) <= 0) {
            toast({ description: "Please enter a valid max calls value", variant: "destructive" });
            return;
        }
        if (quotaForm.duration === "Monthly" && !quotaForm.next_reset_at) {
            toast({ description: "Please set a reset date for monthly quotas", variant: "destructive" });
            return;
        }
        const targetCallType = quotaForm.call_type;
        const duplicate = quotas.some(q => q.callType === targetCallType);
        if (duplicate) {
            const label = QUOTA_CALL_TYPES.find(t => t.value === targetCallType)?.label || targetCallType;
            toast({ description: `A quota for "${label}" already exists. Edit the existing one instead.`, variant: "destructive" });
            return;
        }
        setIsSubmittingQuota(true);
        const result = await createUsageQuota(currentUser?.token, {
            call_type: quotaForm.call_type,
            max_calls: Number(quotaForm.max_calls),
            duration: quotaForm.duration,
            next_reset_at: quotaForm.duration === "Monthly" ? quotaForm.next_reset_at : null,
        });
        if (result.success) {
            setQuotaForm({ call_type: "", duration: "Monthly", max_calls: "", next_reset_at: "" });
            setQuotaDialogOpen(false);
            await fetchQuotas();
            toast({ description: "Usage quota created" });
        } else {
            toast({ description: result.message || "Failed to create quota", variant: "destructive" });
        }
        setIsSubmittingQuota(false);
    };

    const openEditQuota = (quota) => {
        setEditQuotaForm({ id: quota.id, max_calls: String(quota.maxCalls) });
        setEditQuotaDialogOpen(true);
    };

    const handleUpdateQuota = async () => {
        if (!editQuotaForm.max_calls || Number(editQuotaForm.max_calls) <= 0) {
            toast({ description: "Please enter a valid max calls value", variant: "destructive" });
            return;
        }
        setIsUpdatingQuota(true);
        const result = await updateUsageQuota(currentUser?.token, {
            id: editQuotaForm.id,
            max_calls: Number(editQuotaForm.max_calls),
        });
        if (result.success) {
            setEditQuotaDialogOpen(false);
            await fetchQuotas();
            toast({ description: "Quota updated successfully" });
        } else {
            toast({ description: result.message || "Failed to update quota", variant: "destructive" });
        }
        setIsUpdatingQuota(false);
    };

    const handleDeleteQuota = async (id) => {
        setIsDeletingQuotaId(id);
        const result = await deleteUsageQuota(currentUser?.token, id);
        if (result.success) {
            await fetchQuotas();
            toast({ description: "Quota deleted" });
        } else {
            toast({ description: result.message || "Failed to delete quota", variant: "destructive" });
        }
        setIsDeletingQuotaId(null);
    };

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
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[280px] justify-between">
                                {selectedTypes.length === CALL_TYPES.length
                                    ? "All endpoints"
                                    : selectedTypes.length === 0
                                        ? "Select endpoints"
                                        : `${selectedTypes.length} selected`}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-2">
                            <div className="space-y-1 max-h-64 overflow-auto">
                                {CALL_TYPES.map((type) => (
                                    <div
                                        key={type.value}
                                        className="flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent"
                                        onClick={() => toggleType(type.value)}
                                    >
                                        <div className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            selectedTypes.includes(type.value)
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50"
                                        )}>
                                            {selectedTypes.includes(type.value) && <Check className="h-3 w-3" />}
                                        </div>
                                        <span className="text-sm">{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
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

            {/* api usage chart */}
            <APIUsage graphData={graphData} isLoading={loading} />

            
            <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-sm font-medium text-white dark:text-white">Usage Quotas</h2>
                        <p className="text-xs text-[#aaa] mt-1">Set rate limits on API calls per endpoint and time period</p>
                    </div>
                    <Dialog open={quotaDialogOpen} onOpenChange={setQuotaDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                                <PlusIcon className="w-4 h-4 mr-1" /> Add Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Usage Quota</DialogTitle>
                                <DialogDescription>
                                    Set a maximum number of API calls for a given time period. Leave endpoint blank to apply globally.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                    <Label>Endpoint</Label>
                                    <Select
                                        value={quotaForm.call_type}
                                        onValueChange={(v) => setQuotaForm(f => ({ ...f, call_type: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an endpoint" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {QUOTA_CALL_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="quota-maxcalls">Max Calls</Label>
                                    <Input
                                        id="quota-maxcalls"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 10000"
                                        value={quotaForm.max_calls}
                                        onChange={(e) => setQuotaForm(f => ({ ...f, max_calls: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Duration</Label>
                                    <Select
                                        value={quotaForm.duration}
                                        onValueChange={(v) => setQuotaForm(f => ({ ...f, duration: v, next_reset_at: "" }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DURATIONS.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {quotaForm.duration === "Monthly" && (
                                    <div className="space-y-1">
                                        <Label htmlFor="quota-reset">Next Reset Date</Label>
                                        <Input
                                            id="quota-reset"
                                            type="date"
                                            value={quotaForm.next_reset_at}
                                            onChange={(e) => setQuotaForm(f => ({ ...f, next_reset_at: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                    onClick={handleCreateQuota}
                                    disabled={isSubmittingQuota}
                                >
                                    {isSubmittingQuota ? "Creating..." : "Create Quota"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                
                <Dialog open={editQuotaDialogOpen} onOpenChange={setEditQuotaDialogOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Edit Usage Quota</DialogTitle>
                            <DialogDescription>Update the maximum number of allowed calls.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-maxcalls">Max Calls</Label>
                                <Input
                                    id="edit-maxcalls"
                                    type="number"
                                    min="1"
                                    value={editQuotaForm.max_calls}
                                    onChange={(e) => setEditQuotaForm(f => ({ ...f, max_calls: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                onClick={handleUpdateQuota}
                                disabled={isUpdatingQuota}
                            >
                                {isUpdatingQuota ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {quotasLoading ? (
                    <p className="text-sm text-[#aaa] py-4">Loading quotas...</p>
                ) : quotas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#aaa] border border-dashed rounded-md">
                        <ShieldAlertIcon className="w-8 h-8 opacity-40" />
                        <p className="text-sm">No usage quotas configured</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Endpoint</TableHead>
                                <TableHead>Max Calls</TableHead>
                                <TableHead>Next Reset</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotas.map((quota, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {quota.callType || "All"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{quota.maxCalls?.toLocaleString()}</TableCell>
                                    <TableCell className="text-sm">
                                        {quota.nextResetAt ? quota.nextResetAt.slice(0, 10) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-1">
                                            <Button
                                                variant="link"
                                                onClick={() => openEditQuota(quota)}
                                                className="p-2"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => handleDeleteQuota(quota.id)}
                                                disabled={isDeletingQuotaId === quota.id}
                                                className="p-2"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
