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
        <Page>
            <PageIntro
                title="My Subscription"
                description="Your active plan and the bundles you can upgrade to."
            />
            {activePlan && (
                <Section title="Current plan">
                    <Plan data={activePlan} label="Current Plan" isCurrentPlan={true} index={0} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                </Section>
            )}
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
                        .filter(p => p.id !== activePlan?.id)
                        .map((plan, idx) => (
                            <Plan key={plan.id || idx} data={plan} label="Upgrade" index={idx} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                        ))}
                    <Plan data={enterprise} label="Upgrade" key={enterprise.name} index={plans.length || 0} activeTab={activeTab} monthlyPlans={monthlyPlans} />
                </div>
            </Section>
        </Page>
    );
}
