//@ts-nocheck
"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Page, PageIntro, Section } from "@/components/dashboard/page";
import { useQuery } from "@tanstack/react-query";
import { buyCredit, getAllCredits } from "@/service/apis";
import { useContext, useState } from "react";
import { AuthContext } from "@/providers/AuthProvider";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { queryClient } from "@/providers/QueryProvider";
import { useRouter } from 'nextjs-toploader/app';
import { Plan } from '@/sections/Pricing';
import { getCurrentPlan } from '@/lib/subscription';
import CurrentPlanCard from './CurrentPlanCard';

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

    const currentPlan = getCurrentPlan(currentUser?.user);
    const bundleNameFor = (id) => plans.find(p => p.id === id)?.name;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <Page>
            <PageIntro
                title="My Subscription"
                description="Your active plan and the bundles you can upgrade to."
            />
            <Section title="Current plan">
                <CurrentPlanCard plan={currentPlan} bundleNameFor={bundleNameFor} />
            </Section>
            <Section
                title="Available plans"
                action={
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="border-b-0">
                            <TabsTrigger value="monthly" className="py-2">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly" className="py-2">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                }
            >
                <div className="flex flex-wrap gap-4">
                    {(activeTab === "monthly" ? monthlyPlans : yearlyPlans)
                        .map((plan, idx) => (
                            <Plan key={plan.id || idx} data={plan} label="Upgrade" index={idx} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                        ))}
                    <Plan data={enterprise} label="Upgrade" key={enterprise.name} index={plans.length || 0} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                </div>
            </Section>
        </Page>
    );
}
