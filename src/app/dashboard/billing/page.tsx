//@ts-nocheck
"use client";
import React, {useContext, useState} from "react";
import {getAllBilling, getUser, verifyPayment} from "@/service/apis";
import Image from "next/image";
import {useQuery} from "@tanstack/react-query";
import {queryClient} from "@/providers/QueryProvider";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AuthContext} from "@/providers/AuthProvider";
import Spinner from "@/components/Spinner";

export default function BillingHistory() {
    const {currentUser, setCurrentUser} = useContext(AuthContext)
    const {toast} = useToast()

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
    }

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 4;


    const [capAmountInput, setCapAmountInput] = useState("");
    const [isSettingCap, setIsSettingCap] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["history", currentUser.token, currentPage],
        queryFn: () => getAllBilling(currentUser.token, currentPage, limit),
        staleTime: 5 * 60 * 1000,
    });

    const totalPages = Math.ceil(data?.count / limit);

    const handleVerifyPayment = (id) => async () => {
        const response = await verifyPayment(currentUser.token, id);
        if (response.data === "Payment Successful") {
            queryClient.invalidateQueries("history");
            const response = await getUser(currentUser.token)
            setCurrentUser(response.data)
            toast({description: "Successfully Verified"});
        } else {
            toast({description: "Payment not verified", variant: "destructive"});
        }
    };

    const handleSetCap = async () => {
        if (!capAmountInput || Number(capAmountInput) <= 0) {
            toast({description: "Please enter a valid cap amount", variant: "destructive"});
            return;
        }
        setIsSettingCap(true);
        // todo: backend not ready
        setCapAmountInput("");
        toast({description: "Spending cap set successfully"});
        setIsSettingCap(false);
    };

    return (
        <div className="p-4 rounded-lg min-h-[60vh]">

            {/*for spending cap*/}
            <h2 className="text-xl text-white font-semibold mb-4 ">Spending Cap</h2>
            <div className="border border-dashed rounded-lg p-6 mb-8 max-w-md">
                <p className="text-sm text-[#aaa] mb-4">
                    Set a maximum spending limit to avoid unexpected charges.
                </p>
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

            <h2 className="text-xl text-white font-semibold mb-4 mt-[40px]">Billing History</h2>
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
        </div>
    );
}
