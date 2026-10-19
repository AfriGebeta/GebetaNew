//@ts-nocheck
"use client"
import { pricing } from "@/constants";
import { useContext, useEffect, useState } from "react";
import { RevealBlur, RevealBlurItem } from "@/components/marketing/reveal";
import { useQuery } from "@tanstack/react-query";
import { buyCredit, getAllCredits } from "@/service/apis";
import { useRouter } from 'nextjs-toploader/app';
import { queryClient } from "@/providers/QueryProvider";
import { AuthContext } from "@/providers/AuthProvider";
import useGeoLocation from "react-ipgeolocation";
import { motion } from "motion/react";
import Container from "@/sections/Container";
import { ArrowRight, Check, Mail } from "lucide-react";
import { IN_VIEW, blurFadeRise, stagger, staggerBlur } from "@/lib/motion";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Tag from "@/components/ui/tag";
import SegmentedControl from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

export default function Pricing({ initialData, initialExchangeRate }: { initialData?: any; initialExchangeRate?: number }) {
    return (
        <section id="pricing" className="py-24 md:py-28">
            <motion.div variants={staggerBlur()} initial="hidden" whileInView="show" viewport={IN_VIEW}>
            <Container className="flex flex-col gap-4">
                <motion.h2 variants={blurFadeRise} className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                    Start free, pay as you grow
                </motion.h2>
                <motion.p variants={blurFadeRise} className="max-w-[48ch] text-[18px] leading-[1.5] text-soft">
                    Every plan includes all APIs. Pick a monthly bundle, or talk to us about unlimited volume.
                </motion.p>
            </Container>
            </motion.div>
            <Plans initialData={initialData} initialExchangeRate={initialExchangeRate} />
        </section>
    )
}


export function Plans({ initialData, initialExchangeRate }: { initialData?: any; initialExchangeRate?: number }) {
    const enterprise = {
        name: "Custom",
        price: "",
        description: "Best choice for high usage by any organization",
        expiredIn: 30,
        call_caps: ["Unlimited", "Unlimited", "Unlimited", "Unlimited", "Unlimited", "Unlimited"],
        included_call_types: ["Geocoding", "Direction", "Matrix", "TSS", "ONM", "Tile"],
    };

    const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const { data } = useQuery({
        queryKey: ['plans'],
        queryFn: () => getAllCredits({ page: 1, limit: 10 }),
        initialData: initialData,
        staleTime: 5 * 60 * 1000,
    });

    const monthlyPlans = data?.credit_bundles?.filter(credit => credit.expiredIn === 30)?.reverse() || [];
    const yearlyPlans = data?.credit_bundles?.filter(credit => credit.expiredIn === 365 && credit?.name !== "Developer") || [];
    const devPackage = data?.credit_bundles?.filter(credit => credit.expiredIn === 365 && credit?.name === "Developer")


    return (
        <Container>
            <div className="w-full">
                <div className="mt-10 flex items-center gap-3">
                    <SegmentedControl
                        aria-label="Billing period"
                        value={activeTab}
                        onValueChange={(v) => handleTabChange(v as "monthly" | "yearly")}
                        options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
                    />
                    <Tag tone="green">Save up to 20% yearly</Tag>
                </div>
                <RevealBlur className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <RevealBlurItem><Plan data={devPackage?.[0]} index={data?.length || 1} initialExchangeRate={initialExchangeRate} /></RevealBlurItem>
                    {
                        (activeTab === "monthly" ? monthlyPlans : yearlyPlans).map((credit, index) => (
                            <RevealBlurItem key={credit.id ?? index}><Plan data={credit} index={index} activeTab={activeTab} monthlyPlans={monthlyPlans} initialExchangeRate={initialExchangeRate} /></RevealBlurItem>
                        ))
                    }
                    <RevealBlurItem><Plan data={enterprise} index={data?.length || 1} initialExchangeRate={initialExchangeRate} /></RevealBlurItem>
                </RevealBlur>
            </div>
        </Container>
    )
}

export function Plan({ data, label, isCurrentPlan, index, activeTab, monthlyPlans, initialExchangeRate }: { data?: any, label?: string; isCurrentPlan?: boolean; index?: number, activeTab: "monthly" | "yearly", monthlyPlans: any[], initialExchangeRate?: number }) {
    const { currentUser } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(false)
    const location = useGeoLocation();
    const [exchangeRate, setExchangeRate] = useState(initialExchangeRate ?? 140);

    useEffect(() => {
        setIsLogin(JSON.parse(localStorage.getItem('isAuthenticated')))
    }, [])

    const router = useRouter();

    const formatPrice = (price) => {
        let displayPrice;
        if (isNaN(price)) {
            displayPrice = 0;
        } else {
            displayPrice = price;
        }

        const isEthiopia = location.country === 'ET' || !location.country;

        if (isEthiopia) {
            const etbPrice = Math.ceil(displayPrice * exchangeRate);
            return `${etbPrice.toLocaleString("en-ET")} Birr`;
        } else {
            return `$${Math.round(displayPrice).toLocaleString("en-US")} USD`;
        }
    };

    const handleUpgrade = (id) => {
        if (!isLogin) {
            router.push('/auth/signin')
        } else {
            if (data.name !== "Custom") {
                buyCredit(currentUser?.token, id)
                    .then(response => {
                        queryClient.invalidateQueries('history')
                        if (response.data.data.status === "success") {
                            window.open(response.data.data.data.checkout_url, '_blank');
                        }
                    })
                    .catch(err => {
                    });
            } else {
                router.push('/contact')
            }
        }
    };

    const isPurchased = data?.name !== 'Custom' ? currentUser?.user?.credits?.find(item => item?.bundle_id === data?.id) : false

    if (!data) {
        return
    }
    const featured = data?.name === "Start up";
    const isCustom = data.name === "Custom";

    return (
        <Card className={cn("relative flex h-full flex-col justify-between gap-8 p-6", featured && "shadow-[0_0_0_1.5px_hsl(var(--ink))]")}>
            <div className="flex flex-col gap-5">
                <h3 className="text-[18px] font-medium text-foreground">{data?.name}</h3>

                <p className="text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums text-foreground">
                    {!isCustom ? activeTab === "yearly" ? (
                        data.price === 0 ? "Free" : (
                            <>
                                {formatPrice(data.price / 12)}
                                <span className="text-[15px] font-normal tracking-normal text-subtle"> / month, billed yearly</span>
                            </>
                        )
                    ) : (
                        !data.price ? "Free" : (
                            <>
                                {formatPrice(data.price)}
                                <span className="text-[15px] font-normal tracking-normal text-subtle"> / month</span>
                            </>
                        )
                    ) : "Let's talk"}
                </p>
                <p className="text-[15px] leading-[1.5] text-soft">{!isCustom ? pricing[index]?.subtitle : data.description}</p>

                <ul className="flex flex-col gap-3 text-[15px] text-foreground">
                    {(data.included_call_types || []).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                            <Check aria-hidden className="size-4 shrink-0 text-success" />
                            {(data.call_caps?.[featureIndex] != null ? data.call_caps[featureIndex] + " " : "") + feature.charAt(0).toUpperCase() + feature.slice(1).toLowerCase() + " calls" + `${feature === "TILE" ? " (daily limit)" : ""}`}
                        </li>
                    ))}
                </ul>
            </div>

            <Button
                size="lg"
                variant={isCurrentPlan ? "secondary" : featured ? "primary" : "secondary"}
                disabled={isCurrentPlan || !!isPurchased}
                onClick={() => handleUpgrade(data.id)}
                className={cn(label && "w-full")}
            >
                {isCustom && !label && <Mail aria-hidden />}
                {label ? label : `Choose ${data.name}`}
                {!isCustom && !label && <ArrowRight aria-hidden />}
            </Button>
        </Card>
    )
}
