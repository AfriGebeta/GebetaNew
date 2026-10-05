//@ts-nocheck
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { buyCredit, getAllCredits } from "@/service/apis";
import { useContext, useState } from "react";
import { AuthContext } from "@/providers/AuthProvider";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { queryClient } from "@/providers/QueryProvider";
import { useRouter } from 'nextjs-toploader/app';
import { Plan } from '@/sections/Pricing';

export default function UserPlan() {
    const enterprise = {
        name: "Custom",
        price: "",
        expiredIn: 30,
        call_caps: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"],
        included_call_types: ["Geocoding", "Direction", "Matrix", "Route"],
    };

    const { currentUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("monthly");

    const { data } = useQuery({
        queryKey: ['plans'],
        queryFn: () => getAllCredits({ page: 1, limit: 10 }),
        staleTime: 5 * 60 * 1000,
    });

    const plans = data?.credit_bundles || [];
    const monthlyPlans = plans.filter(plan => plan.expiredIn === 30);
    const yearlyPlans = plans.filter(plan => plan.expiredIn === 365);

    // Prefer a real paid credit over the freemium one when the user has both -
    // otherwise this always shows Freemium as "Current Plan" since it's
    // typically the first bundle a new account is granted, regardless of
    // whatever they've actually paid for since.
    const purchasedCredits = currentUser?.user?.credits || [];
    const activeCredit = purchasedCredits.find(c => !c.is_freeemium) || purchasedCredits[0];
    const activePlan = activeCredit ? plans.find(p => p.id === activeCredit.bundle_id) || null : null;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex flex-col px-8 py-6">
            <h2 className="text-xl font-semibold mb-4">My Subscription</h2>
            {activePlan && (
                <div className="mb-6">
                    <Plan data={activePlan} label="Current Plan" isCurrentPlan={true} index={0} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                </div>
            )}
            <div className="flex flex-col gap-4 mb-8 mt-4">
                <div className="self-center bg-[#FFA500] p-1 rounded-full inline-flex">
                    <div className="relative">
                        <div className="absolute inset-0 flex" aria-hidden="true">
                            <div
                                className={`w-1/2 bg-white rounded-full transition-all duration-300 ease-out ${activeTab === "yearly" ? "translate-x-full" : ""}`}
                            ></div>
                        </div>
                        <div className="relative flex">
                            <button
                                type="button"
                                className={`w-24 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === "monthly" ? "text-[#FFA500]" : "text-white"}`}
                                onClick={() => handleTabChange("monthly")}
                            >
                                Monthly
                            </button>
                            <button
                                type="button"
                                className={`w-24 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${activeTab === "yearly" ? "text-[#FFA500]" : "text-white"}`}
                                onClick={() => handleTabChange("yearly")}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                    {(activeTab === "monthly" ? monthlyPlans : yearlyPlans)
                        .filter(p => p.id !== activePlan?.id)
                        .map((plan, idx) => (
                            <Plan key={plan.id || idx} data={plan} label="Upgrade" index={idx} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                        ))}
                    <Plan data={enterprise} label="Upgrade" key={enterprise.name} index={plans.length || 0} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                </div>
            </div>
        </div>
    );
}