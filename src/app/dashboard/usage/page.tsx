// @ts-nocheck
"use client";

import {useContext, useEffect, useMemo, useState} from "react";
import {
    getUserUsage,
    getUsageQuotas,
    createUsageQuota,
    updateUsageQuota,
    deleteUsageQuota,
} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import {Checkbox} from "@/components/ui/checkbox";
import Field from "@/components/ui/field";
import Tag from "@/components/ui/tag";
import {EmptyState, Page, PageIntro, Section} from "@/components/dashboard/page";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ChevronDown, PencilIcon, PlusIcon, ShieldAlertIcon, Trash2Icon} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {StatCard, StatCardSkeleton} from "@/components/dashboard/stat-card";
import UsageChart from "@/components/dashboard/usage-chart/usage-chart";
import {Icons} from "@/components/icons";
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow} from "@/components/ui/table";
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

const CALL_TYPE_LABELS = Object.fromEntries(CALL_TYPES.map((t) => [t.value, t.label]));

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

    const date = new Date();
    const currentDate = date.toJSON().slice(0, 10);
    const thirtyDaysAgo = new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toJSON().slice(0, 10);

    const [startingDate, setStartingDate] = useState(thirtyDaysAgo);
    const [endingDate, setEndingDate] = useState(currentDate);
    const [selectedTypes, setSelectedTypes] = useState(CALL_TYPES.map(t => t.value));
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

    useEffect(() => {
        fetchQuotas();
    }, []);


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
            label: metric.calltype,
            value: Number(metric.total).toLocaleString(),
            hint: metric.label,
        })),
        {
            label: "Total",
            value: Number(totalCalls).toLocaleString(),
            hint: "Calls in range",
        },
    ];

    const endpointLabel = selectedTypes.length === CALL_TYPES.length
        ? "All endpoints"
        : selectedTypes.length === 0
            ? "Select endpoints"
            : `${selectedTypes.length} selected`;

    const quotaEndpointLabel = (callType) =>
        QUOTA_CALL_TYPES.find((t) => t.value === callType)?.label ?? callType ?? "All";

    return (
        <Page>
            <PageIntro
                title="Usage"
                description="Track call volume per endpoint over time and set quotas to cap spend."
            />

            <div className="flex flex-wrap items-end gap-3">
                <Field label="Endpoints" htmlFor="endpoint-filter">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <button
                                id="endpoint-filter"
                                type="button"
                                className="group flex h-9 w-[220px] cursor-pointer items-center justify-between gap-2 rounded-lg border border-line-strong bg-secondary px-3 text-[14px] leading-none text-foreground outline-none transition-[border-color] duration-150 ease-power3-out focus-visible:border-ring"
                            >
                                {endpointLabel}
                                <ChevronDown aria-hidden className="size-3.5 shrink-0 text-subtle transition-transform duration-200 ease-power3-out group-data-[state=open]:rotate-180" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[220px] p-1">
                            <ul className="flex max-h-64 flex-col overflow-auto">
                                {CALL_TYPES.map((type) => (
                                    <li key={type.value}>
                                        <label
                                            htmlFor={`endpoint-${type.value}`}
                                            className="caption-style flex cursor-pointer items-center gap-2 rounded-md p-2 text-foreground transition-colors duration-150 ease-power3-out hover:bg-hover"
                                        >
                                            <Checkbox
                                                id={`endpoint-${type.value}`}
                                                checked={selectedTypes.includes(type.value)}
                                                onCheckedChange={() => toggleType(type.value)}
                                            />
                                            {type.label}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </PopoverContent>
                    </Popover>
                </Field>
                <Field label="From" htmlFor="usage-from">
                    <DatePicker
                        id="usage-from"
                        value={startingDate}
                        onChange={setStartingDate}
                    />
                </Field>
                <Field label="To" htmlFor="usage-to">
                    <DatePicker
                        id="usage-to"
                        value={endingDate}
                        onChange={setEndingDate}
                    />
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usageLoading
                    ? cards.map((_, i) => <StatCardSkeleton key={i} />)
                    : cards.map((card, i) => <StatCard key={i} {...card} />)}
            </div>

            <UsageChart
                token={currentUser?.token}
                types={selectedTypes}
                typeLabels={CALL_TYPE_LABELS}
                start={startingDate}
                end={endingDate}
                onRangeChange={(start, end) => {
                    setStartingDate(start);
                    setEndingDate(end);
                }}
            />

            <Section
                title="Usage quotas"
                description="Set rate limits on API calls per endpoint and time period"
                action={
                    <Dialog open={quotaDialogOpen} onOpenChange={setQuotaDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <PlusIcon aria-hidden /> Add Quota
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Usage Quota</DialogTitle>
                                <DialogDescription>
                                    Set a maximum number of API calls for a given time period. Leave endpoint blank to apply globally.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                <Field label="Endpoint" htmlFor="quota-endpoint">
                                    <Select
                                        value={quotaForm.call_type}
                                        onValueChange={(v) => setQuotaForm(f => ({ ...f, call_type: v }))}
                                    >
                                        <SelectTrigger id="quota-endpoint">
                                            <SelectValue placeholder="Select an endpoint" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {QUOTA_CALL_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label="Max Calls" htmlFor="quota-maxcalls" required>
                                    <Input
                                        id="quota-maxcalls"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 10000"
                                        value={quotaForm.max_calls}
                                        onChange={(e) => setQuotaForm(f => ({ ...f, max_calls: e.target.value }))}
                                    />
                                </Field>
                                <Field label="Duration" htmlFor="quota-duration">
                                    <Select
                                        value={quotaForm.duration}
                                        onValueChange={(v) => setQuotaForm(f => ({ ...f, duration: v, next_reset_at: "" }))}
                                    >
                                        <SelectTrigger id="quota-duration">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DURATIONS.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                {quotaForm.duration === "Monthly" && (
                                    <Field label="Next Reset Date" htmlFor="quota-reset">
                                        <DatePicker
                                            id="quota-reset"
                                            value={quotaForm.next_reset_at}
                                            onChange={(value) => setQuotaForm(f => ({ ...f, next_reset_at: value }))}
                                        />
                                    </Field>
                                )}
                            </DialogBody>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="primary"
                                    onClick={handleCreateQuota}
                                    disabled={isSubmittingQuota}
                                >
                                    {isSubmittingQuota ? "Creating..." : "Create Quota"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            >
                <Dialog open={editQuotaDialogOpen} onOpenChange={setEditQuotaDialogOpen}>
                    <DialogContent className="max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Edit Usage Quota</DialogTitle>
                            <DialogDescription>Update the maximum number of allowed calls.</DialogDescription>
                        </DialogHeader>
                        <DialogBody>
                            <Field label="Max Calls" htmlFor="edit-maxcalls">
                                <Input
                                    id="edit-maxcalls"
                                    type="number"
                                    min="1"
                                    value={editQuotaForm.max_calls}
                                    onChange={(e) => setEditQuotaForm(f => ({ ...f, max_calls: e.target.value }))}
                                />
                            </Field>
                        </DialogBody>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="primary"
                                onClick={handleUpdateQuota}
                                disabled={isUpdatingQuota}
                            >
                                {isUpdatingQuota ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {quotasLoading ? (
                    <p className="caption-style py-4 text-subtle">Loading quotas...</p>
                ) : quotas.length === 0 ? (
                    <EmptyState icon={<ShieldAlertIcon />} title="No usage quotas configured" />
                ) : (
                    <TableContainer>
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
                                            <Tag size="sm">{quotaEndpointLabel(quota.callType)}</Tag>
                                        </TableCell>
                                        <TableCell className="tabular-nums">{quota.maxCalls?.toLocaleString()}</TableCell>
                                        <TableCell className="tabular-nums text-soft">
                                            {quota.nextResetAt ? quota.nextResetAt.slice(0, 10) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditQuota(quota)}
                                                    aria-label="Edit quota"
                                                >
                                                    <PencilIcon aria-hidden />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteQuota(quota.id)}
                                                    disabled={isDeletingQuotaId === quota.id}
                                                    aria-label="Delete quota"
                                                    className="hover:text-danger"
                                                >
                                                    <Trash2Icon aria-hidden />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Section>
        </Page>
    );
}
