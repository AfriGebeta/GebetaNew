//@ts-nocheck
"use client";
import React, { useContext, useState } from "react";
import { getAllBilling, getUser, verifyPayment, getBillingCaps, createBillingCap, deleteBillingCap, updateBillingCap } from "@/service/apis";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/providers/AuthProvider";
import Spinner from "@/components/Spinner";
import { PencilIcon, Trash2Icon } from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
            const response = await getUser(currentUser.token)
            setCurrentUser(response.data)
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

    return (
        <div className="p-4 rounded-lg min-h-[60vh]">
            <h2 className="text-xl text-white font-semibold mb-4">Billing History</h2>
            {isLoading ? (
                <Spinner />
            ) : data?.billing?.length > 0 ? (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.billing.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.credit.credit_bundle.name} Pac.</TableCell>
                                    <TableCell>{formatDate(item.created_at)}</TableCell>
                                    <TableCell>
                                        {item.installments.map((installment, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <span>{installment.status}</span>
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {item.installments.map((installment, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {installment.method === "CHAPA" && (
                                                    <Image src="/assets/chapa.png" alt="chapa logo" width={20} height={20} />
                                                )}
                                                <span>{installment.method}</span>
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {item.installments.map((installment, idx) => (
                                            <div key={idx}>{installment.amount} ETB</div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        {item.installments.map((installment, idx) => (
                                            installment.status === "PENDING" && (
                                                <Button
                                                    key={idx}
                                                    onClick={handleVerifyPayment(installment.id)}
                                                    className="bg-[#FFA500] px-4 py-2 rounded-md"
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

                    {/* Pagination */}
                    <div className="mt-6 flex justify-between">
                        <Button
                            onClick={() => setCurrentPage((page) => page - 1)}
                            disabled={currentPage === 1}
                            className="bg-[#FFA500] px-4 py-2 rounded-md"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage((page) => page + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-[#FFA500] px-4 py-2 rounded-md"
                        >
                            Next
                        </Button>
                    </div>
                </>
            ) : (
                <div className="h-[350px] flex flex-col justify-center gap-4 items-center">
                    <Image src="/assets/billing.svg" width={80} height={80} />
                    <p>No Billing History</p>
                </div>
            )}

            {/*for spending cap*/}
            <div className="mt-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-sm font-medium text-white">Spending Cap</h2>
                        <p className="text-xs text-[#aaa] mt-1">Set a maximum spending limit to avoid unexpected charges</p>
                    </div>
                </div>

                <div className="border border-dashed rounded-lg p-6 mb-4">
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="cap-amount">Cap Amount (ETB)</Label>
                            <Input
                                id="cap-amount"
                                type="number"
                                min="1"
                                placeholder="e.g. 500"
                                value={capAmountInput}
                                onChange={(e) => setCapAmountInput(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>
                        <Button
                            className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                            onClick={handleSetCap}
                            disabled={isSettingCap}
                        >
                            {isSettingCap ? "Setting..." : "Set Cap"}
                        </Button>
                    </div>
                </div>

                {capsLoading ? (
                    <p className="text-sm text-[#aaa] py-4">Loading cap...</p>
                ) : !billingCaps?.success || !billingCaps?.data ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#aaa] border border-dashed rounded-md">
                        <p className="text-sm">No spending cap configured</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cap Amount</TableHead>
                                <TableHead>Estimated Spend</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Reset</TableHead>
                                <TableHead>Next Reset</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">{billingCaps.data.capAmount} ETB</TableCell>
                                <TableCell>{billingCaps.data.estimatedSpend} ETB</TableCell>
                                <TableCell>
                                    <span className={billingCaps.data.exceeded ? "text-red-500" : "text-green-500"}>
                                        {billingCaps.data.exceeded ? "Exceeded" : "Active"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm">{formatDate(billingCaps.data.lastResetAt)}</TableCell>
                                <TableCell className="text-sm">{formatDate(billingCaps.data.nextResetAt)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-1">
                                        {/* <Button
                                            variant="link"
                                            onClick={() => openEditCap(billingCaps.data)}
                                            className="p-2"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </Button> */}
                                        <Button
                                            variant="link"
                                            onClick={() => handleDeleteCap(billingCaps.data.id)}
                                            className="p-2 text-red-500 hover:text-red-600"
                                        >
                                            <Trash2Icon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={editCapDialogOpen} onOpenChange={setEditCapDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Spending Cap</DialogTitle>
                        <DialogDescription>Update the maximum spending limit.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label htmlFor="edit-cap">Cap Amount (ETB)</Label>
                            <Input
                                id="edit-cap"
                                type="number"
                                min="1"
                                value={editCapForm.max_calls}
                                onChange={(e) => setEditCapForm(f => ({ ...f, max_calls: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                            onClick={handleUpdateCap}
                            disabled={isUpdatingCap}
                        >
                            {isUpdatingCap ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
