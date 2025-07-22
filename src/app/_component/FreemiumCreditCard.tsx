//@ts-nocheck
"use client";

import {useContext, useEffect, useState} from 'react';
import {Crown, Gift} from 'lucide-react';
import {useMutation} from "@tanstack/react-query";
import {AuthContext} from "@/providers/AuthProvider";
import {useToast} from "@/hooks/use-toast";
import {useRouter} from "nextjs-toploader/app";
import {apiClient} from "@/service/apiClient";

const FreemiumCreditCard = () => {
    const {toast}= useToast()
    const router = useRouter()
    const {currentUser} = useContext(AuthContext)

    const [claimed, setClaimed] = useState(currentUser?.user?.claimed_freemium);
    const [totalCredit, setTotalCredit] = useState(0);

    // const isSubscribedUser =  currentUser?.user?.map(i)
    

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
            toast({description: error?.response?.data?.error?.additional.claim?.[0], variant: "destructive"})
        }
    })

    const handleClaimFreemiumCredit = async () => {
        if(!claimed) {
            await claimFreemiumCredit.mutateAsync()
        } else {
            router.push("/pricing")
        }
    }

    return (
        <div
            className="flex justify-center items-center p-2"
            style={{
                visibility: currentUser?.user?.purchased_date ? "hidden": "block",
            }}
        >
            <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-pink-500 opacity-90" />

                    <div className="relative p-6">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-white">
                                <p className="text-sm font-semibold">Credit Balance</p>
                                <p className="text-xl font-bold">{claimed ? totalCredit : 'FREE'} <span className="text-[20px]">Credits</span></p>
                            </div>
                            {claimed ? (
                                <Crown className="text-yellow-300 w-8 h-8" />
                            ) : (
                                <Gift className="text-white w-8 h-8" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleClaimFreemiumCredit}
                                className={`w-full py-3 px-4 rounded-lg whitespace-nowrap font-semibold transition-all duration-300 
                  ${claimed
                                    ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                                    : 'bg-white hover:bg-gray-100 text-[#FFA500]'
                                }`}
                            >
                                {claimed ? 'Subscribe to Pro' : 'Claim Free'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreemiumCreditCard;