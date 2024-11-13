//@ts-nocheck
"use client";
import React, {useContext, useState} from "react";
import {getAllBilling, getUser, verifyPayment} from "@/service/apis";
import Image from "next/image";
import {useQuery} from "@tanstack/react-query";
import {queryClient} from "@/providers/QueryProvider";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {AuthContext} from "@/providers/AuthProvider";

export default function BillingHistory() {
    const {currentUser, setCurrentUser} = useContext(AuthContext)

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;
    }

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 4;

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
            toast.success("Successfully Verified");
        } else {
            toast.error("Payment not verified");
        }
    };

    return (
        <div className="p-4 rounded-lg min-h-[60vh]">
            <h2 className="text-xl text-white font-semibold mb-4 mt-[40px]">Billing History</h2>
            {isLoading ? (
                <div>Loading...</div>
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
