//@ts-nocheck
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAllCredits, buyCredit } from "@/service/apis";
import { useContext, useState } from "react";
import { AuthContext } from "@/providers/AuthProvider";
import { Check } from "lucide-react";
import {useToast} from "@/hooks/use-toast"
import {queryClient} from "@/providers/QueryProvider";
import {useRouter} from "next/navigation";

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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex flex-col px-8 py-6">
            <h2 className="text-xl font-semibold mb-4 mt-[40px]">My Subscription</h2>
            <div className="flex justify-center mb-8 mt-4">
                <div className="bg-[#FFA500] p-1 rounded-full inline-flex">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "monthly" ? monthlyPlans : yearlyPlans).map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        currentUser={currentUser}
                    />
                ))}
                <PlanCard plan={enterprise} key={enterprise.name} currentUser={currentUser}/>
            </div>
        </div>
    );
}

function PlanCard({plan, currentUser, key}) {
    const router = useRouter()
    const {toast} = useToast()
    const isPurchased = plan.name !== 'Custom'
        ? currentUser?.user?.credits?.find(item => item.bundle_id === plan.id)
        : false;

    const getButtonText = () => {
        if (isPurchased) return "Selected Plan";
        if (currentUser?.user?.credits?.length > 0) return "Upgrade";
        return `Choose ${plan.name} Plan`;
    };

    const handleUpgrade = () => {
        if (isPurchased) return;

        if (plan.name !== "Custom") {
            buyCredit(currentUser?.token, id)
                .then(response => {
                    queryClient.invalidateQueries('history')
                    if (response.data.data.status === "success") {
                        window.open(response.data.data.Data.checkout_url, '_blank');
                    }
                })
                .catch(err => {
                    const errorMessage = err?.response?.data?.message || "An error occurred. Please try again.";
                    toast({
                        description: errorMessage,
                        variant: "destructive"
                    });
                });
        } else {
            router.push('/contact')
        }
    };


    return (
        <Card className={`relative flex flex-col justify-between ${isPurchased ? "border-2 border-[#FFA500] shadow-lg" : "shadow"} transition-all duration-300`} key={key}>
            {isPurchased && (
                <div className="w-fit absolute -top-4 left-[36%] right-0 bg-[#FFA500] text-white text-xs font-semibold text-center px-4 py-2 rounded-lg">
                    Current Plan
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-2xl font-bold">
                    {plan.name !== "Custom" ? (
                        <>
                            {plan.price} Birr<span className="text-[14px]">/{plan.expiredIn === 30 ? "month" : "year"}</span>
                        </>
                    ) : "Let's talk"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {plan.included_call_types.map((type, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-sm">
                                {plan.call_caps[index]} {type} calls
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button
                    className="w-full py-4 bg-[#FFA500] hover:bg-[#FFA500]/110 text-white transition-all duration-300"
                    variant={isPurchased ? "secondary" : "default"}
                    onClick={handleUpgrade}
                    disabled={isPurchased}
                >
                    {getButtonText()}
                </Button>
            </CardFooter>
        </Card>
    );
}