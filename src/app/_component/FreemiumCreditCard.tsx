//@ts-nocheck
"use client";

import { useContext, useEffect, useState } from 'react';
import { Crown, Gift } from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "nextjs-toploader/app";
import { apiClient } from "@/service/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";

const FreemiumCreditCard = () => {
    const { toast } = useToast()
    const router = useRouter()
    const { currentUser } = useContext(AuthContext)

    const [claimed, setClaimed] = useState(currentUser?.user?.claimed_freemium);
    const [totalCredit, setTotalCredit] = useState(0);

    useEffect(() => {
        const freemiumCredit = currentUser?.user?.remaining?.filter((item) => item?.is_freeemium) ?? {}
        const sum = freemiumCredit?.[0]?.remaining?.reduce((acc, item) =>
            acc + (Number(item) || 0), 0) || 0;
        setTotalCredit(sum)
    }, [currentUser, totalCredit]);


    const claimFreemiumCredit = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post(
                `/payment/freemium/credit`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${currentUser?.token}`,
                        "Content-Type": "application/json",
                    },
                })
            return response.data;
        },
        onSuccess: () => {
            setClaimed(true);
        },
        onError: (error) => {
            const claimMessage = error?.response?.data?.error?.additional?.claim?.[0];
            toast({ description: claimMessage || getErrorMessage(error, "Unable to claim freemium credit"), variant: "destructive" })
        }
    })

    const handleClaimFreemiumCredit = async () => {
        if (!claimed) {
            await claimFreemiumCredit.mutateAsync()
        } else {
            router.push("/pricing")
        }
    }

    if (currentUser?.user?.purchased_date) return null;

    return (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar-accent p-4">
            <div className="flex min-w-0 flex-col gap-2">
                <span className="lead-style block truncate font-medium tracking-[-0.01em] text-foreground">
                    {claimed ? `${totalCredit.toLocaleString()} Credits` : "Free credits"}
                </span>
                <span className="caption-style block truncate text-subtle">
                    {claimed ? "Freemium balance" : "Ready to claim"}
                </span>
            </div>
            <Button
                variant="muted"
                size="md"
                onClick={handleClaimFreemiumCredit}
                disabled={claimFreemiumCredit.isPending}
            >
                {claimed ? <Crown aria-hidden/> : <Gift aria-hidden/>}
                {claimed ? "Upgrade" : "Claim"}
            </Button>
        </div>
    );
};

export default FreemiumCreditCard;
