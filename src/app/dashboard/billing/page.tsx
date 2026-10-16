//@ts-nocheck
"use client";
import React, { useContext, useState } from "react";
import { getAllBilling, getUser, verifyPayment, getBillingCaps, createBillingCap, deleteBillingCap, updateBillingCap } from "@/service/apis";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Field from "@/components/ui/field";
import Tag from "@/components/ui/tag";
import SegmentBar from "@/components/ui/segment-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Page, PageIntro, Section } from "@/components/dashboard/page";
import { AuthContext } from "@/providers/AuthProvider";
import { ChevronLeft, ChevronRight, ReceiptText, Trash2Icon, Wallet } from "lucide-react";
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PricingCalculator from "@/components/pricing-calculator";

export default function BillingHistory() {
    const { currentUser, setCurrentUser } = useContext(AuthContext)
    const { toast } = useToast()

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
    }

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 4;


    const [capAmountInput, setCapAmountInput] = useState("");
    const [isSettingCap, setIsSettingCap] = useState(false);
    const [editCapDialogOpen, setEditCapDialogOpen] = useState(false);
    const [editCapForm, setEditCapForm] = useState({ id: "", max_calls: "" });
    const [isUpdatingCap, setIsUpdatingCap] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["history", currentUser.token, currentPage],
        queryFn: () => getAllBilling(currentUser.token, currentPage, limit),
        staleTime: 5 * 60 * 1000,
    });

    const { data: billingCaps, isLoading: capsLoading } = useQuery({
        queryKey: ["billingCaps", currentUser.token],
        queryFn: () => getBillingCaps(currentUser.token, 1, 20),
        staleTime: 5 * 60 * 1000,
    });

    const totalPages = Math.ceil(data?.count / limit);

    const handleVerifyPayment = (id) => async () => {
        const response = await verifyPayment(currentUser.token, id);
        if (response.data === "Payment Successful") {
            queryClient.invalidateQueries("history");
            const freshUser = await getUser(currentUser.token);
            if (freshUser?.id) {
                setCurrentUser({ ...currentUser, user: freshUser });
            }
            toast({ description: "Successfully Verified" });
        } else {
            toast({ description: "Payment not verified", variant: "destructive" });
        }
    };

    const handleSetCap = async () => {
        if (!capAmountInput || Number(capAmountInput) <= 0) {
            toast({ description: "Please enter a valid cap amount", variant: "destructive" });
            return;
        }
        setIsSettingCap(true);
        const response = await createBillingCap(currentUser.token, Number(capAmountInput));
        if (response.success) {
            queryClient.invalidateQueries(["billingCaps"]);
            setCapAmountInput("");
            toast({ description: "Spending cap set successfully" });
        } else {
            toast({ description: response.message || "Failed to set cap", variant: "destructive" });
        }
        setIsSettingCap(false);
    };

    const handleDeleteCap = async (id) => {
        const response = await deleteBillingCap(currentUser.token, id);
        if (response.success) {
            queryClient.invalidateQueries(["billingCaps"]);
            toast({ description: "Spending cap deleted successfully" });
        } else {
            toast({ description: response.message || "Failed to delete cap", variant: "destructive" });
        }
    };

    const openEditCap = (cap) => {
        setEditCapForm({ id: cap.id, max_calls: String(cap.capAmount) });
        setEditCapDialogOpen(true);
    };

    const handleUpdateCap = async () => {
        if (!editCapForm.max_calls || Number(editCapForm.max_calls) <= 0) {
            toast({ description: "Please enter a valid cap amount", variant: "destructive" });
            return;
        }
        setIsUpdatingCap(true);
        const response = await updateBillingCap(currentUser.token, {
            id: editCapForm.id,
            max_calls: Number(editCapForm.max_calls),
        });
        if (response.success) {
            setEditCapDialogOpen(false);
            queryClient.invalidateQueries(["billingCaps"]);
            toast({ description: "Spending cap updated successfully" });
        } else {
            toast({ description: response.message || "Failed to update cap", variant: "destructive" });
        }
        setIsUpdatingCap(false);
    };

    const statusTone = (status) =>
        status === "SUCCESS" || status === "PAID" || status === "COMPLETED"
            ? "green"
            : status === "PENDING"
                ? "amber"
                : status === "FAILED" || status === "CANCELLED"
                    ? "red"
                    : "neutral";

    const cap = billingCaps?.success ? billingCaps?.data : null;
    const capPercent = cap?.capAmount ? (Number(cap.estimatedSpend) / Number(cap.capAmount)) * 100 : 0;

    return (
        <Page>
            <PageIntro
                title="Billing"
                description="Your payment history and spending controls."
            />

            <Section title="Billing history">
                {isLoading ? (
                    <div className="flex flex-col gap-2 rounded-lg bg-card p-4 shadow-card">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[26px] w-full" />)}
                    </div>
                ) : data?.billing?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <TableContainer>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.billing.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.credit.credit_bundle.name}</TableCell>
                                            <TableCell className="tabular-nums text-soft">{formatDate(item.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-start gap-1">
                                                    {item.installments.map((installment, idx) => (
                                                        <Tag key={idx} size="sm" tone={statusTone(installment.status)}>{installment.status}</Tag>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.installments.map((installment, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-soft">
                                                        {installment.method === "CHAPA" && (
                                                            <Image src="/assets/chapa.png" alt="" width={16} height={16} className="rounded-sm" />
                                                        )}
                                                        <span>{installment.method}</span>
                                                    </div>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {item.installments.map((installment, idx) => (
                                                    <div key={idx}>{installment.amount} ETB</div>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.installments.map((installment, idx) => (
                                                    installment.status === "PENDING" && (
                                                        <Button
                                                            key={idx}
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={handleVerifyPayment(installment.id)}
                                                        >
                                                            Verify
                                                        </Button>
                                                    )
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className="flex items-center justify-between gap-2">
                            <span className="caption-style text-subtle">
                                Page {currentPage}{totalPages ? ` of ${totalPages}` : ""}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft aria-hidden /> Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight aria-hidden />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        icon={<ReceiptText />}
                        title="No billing history"
                        description="Purchases and payments will show up here."
                    />
                )}
            </Section>

            <Section
                title="Spending cap"
                description="Set a maximum spending limit to avoid unexpected charges"
            >
                {capsLoading ? (
                    <Skeleton className="h-[120px] w-full rounded-lg" />
                ) : cap ? (
                    <article className="flex flex-col gap-4 rounded-lg bg-card p-4 shadow-card">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="eyebrow-style text-subtle">Estimated spend</span>
                                <span className="text-[22px] font-medium leading-none tabular-nums text-foreground">
                                    {cap.estimatedSpend} <span className="text-[14px] text-subtle">/ {cap.capAmount} ETB</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag tone={cap.exceeded ? "red" : "green"}>{cap.exceeded ? "Exceeded" : "Active"}</Tag>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCap(cap.id)}
                                    aria-label="Remove spending cap"
                                    className="hover:text-danger"
                                >
                                    <Trash2Icon aria-hidden />
                                </Button>
                            </div>
                        </div>
                        <SegmentBar percent={capPercent} segments={32} tone={cap.exceeded ? "danger" : capPercent > 75 ? "warning" : "success"} />
                        <div className="caption-style flex flex-wrap gap-x-4 gap-y-2 text-subtle">
                            <span>Last reset: <span className="text-soft">{formatDate(cap.lastResetAt)}</span></span>
                            <span>Next reset: <span className="text-soft">{formatDate(cap.nextResetAt)}</span></span>
                        </div>
                    </article>
                ) : (
                    <EmptyState icon={<Wallet />} title="No spending cap configured" description="Set a cap below to stop calls once you hit your limit." />
                )}

                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line-strong p-4">
                    <Field label="Cap amount (ETB)" htmlFor="cap-amount" className="w-full max-w-[240px]">
                        <Input
                            id="cap-amount"
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            value={capAmountInput}
                            onChange={(e) => setCapAmountInput(e.target.value)}
                        />
                    </Field>
                    <Button
                        variant="primary"
                        onClick={handleSetCap}
                        disabled={isSettingCap}
                        className="mb-[3px]"
                    >
                        {isSettingCap ? "Setting..." : "Set Cap"}
                    </Button>
                </div>
            </Section>

            <Section title="Pricing calculator" description="Estimate your cost per API before you scale up.">
                <PricingCalculator />
            </Section>

            <Dialog open={editCapDialogOpen} onOpenChange={setEditCapDialogOpen}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Edit Spending Cap</DialogTitle>
                        <DialogDescription>Update the maximum spending limit.</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                        <Field label="Cap Amount (ETB)" htmlFor="edit-cap">
                            <Input
                                id="edit-cap"
                                type="number"
                                min="1"
                                value={editCapForm.max_calls}
                                onChange={(e) => setEditCapForm(f => ({ ...f, max_calls: e.target.value }))}
                            />
                        </Field>
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="primary"
                            onClick={handleUpdateCap}
                            disabled={isUpdatingCap}
                        >
                            {isUpdatingCap ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Page>
    );
}
