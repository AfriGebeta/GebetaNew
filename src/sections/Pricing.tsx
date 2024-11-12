"use client"
import {pricing} from "../constants";
import Image from "next/image";
import Container from "@/sections/Container";
import {useContext, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {buyCredit, getAllCredits} from "@/service/apis";
import {useRouter} from "next/navigation";
import {queryClient} from "@/providers/QueryProvider";
import {AuthContext} from "@/providers/AuthProvider";


export default function Pricing() {
    const enterprise = {
        name: "Custom",
        price: "",
        expiredIn: 30,
        call_caps: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"],
        included_call_types: ["Geocoding", "Direction", "Matrix", "Route"],
    };

    const [activeTab, setActiveTab] = useState("monthly");
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const {data, isLoading} = useQuery({
        queryKey: ['plans'],
        queryFn: () => getAllCredits({page: 1, limit: 10}),
        staleTime: 5 * 60 * 1000,
    });

    const monthlyPlans = data?.credit_bundles?.filter(credit => credit.expiredIn === 30) || [];
    const yearlyPlans = data?.credit_bundles?.filter(credit => credit.expiredIn === 365) || [];

    console.log(monthlyPlans)

    return (
        <Container>
            <div className="w-full pb-[40px]">
                <h4 className="text-[#979BAA] text-[12px] text-center font-bold tracking-20 uppercase">Scale with
                    us</h4>
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center mt-[10px]">Pricing</h2>
                <p className="text-[#62677F] dark:text-gray-300 text-[20px] text-center leading-25 mt-[42px]">Choose a
                    plan that suits your business best.</p>
                <div className="flex justify-center mt-12 mb-8">
                    <div className="bg-[#FFA500]/60 p-1 rounded-full inline-flex">
                        <div className="relative">
                            <div className="absolute inset-0 flex" aria-hidden="true">
                                <div
                                    className={`w-1/2 bg-white rounded-full transition-all duration-300 ease-out ${
                                        activeTab === "yearly" ? "translate-x-full" : ""
                                    }`}
                                ></div>
                            </div>
                            <div className="relative flex">
                                <button
                                    type="button"
                                    className={`w-24 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                                        activeTab === "monthly" ? "text-[#FFA500]" : "text-white"
                                    }`}
                                    onClick={() => handleTabChange("monthly")}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    className={`w-24 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                                        activeTab === "yearly" ? "text-[#FFA500]" : "text-white"
                                    }`}
                                    onClick={() => handleTabChange("yearly")}
                                >
                                    Yearly
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row mt-[45px] justify-between gap-y-[32px]">
                    {/*{*/}
                    {/*    pricing.map((item, pricingIndex) => (*/}
                    {/*    ))*/}
                    {/*}*/}

                    {
                        (activeTab === "monthly" ? monthlyPlans : yearlyPlans).map((credit, index) => (
                            <Plan data={credit} index={index}/>
                        ))
                    }
                    <Plan data={enterprise} index={data?.length || 1}/>
                </div>
            </div>
        </Container>
    )
}

export  function Plan({data, index}) {
    const {currentUser} = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(false)

    useEffect(() => {
        setIsLogin(JSON.parse(localStorage.getItem('isAuthenticated')))
    },[])

    const router = useRouter();

    const getButtonColor = (title: string) => {
        switch (title) {
            case "Developer":
                return "bg-[#FFBB3E] dark:bg-[#FFBB3E]";
            case "Start up":
                return "bg-[#FFA500] dark:bg-[#FFA500]";
            case "Custom":
                return "bg-[#2E384E] dark:bg-[#2E384E]";
            default:
                return "bg-[#FFBB3E] dark:bg-[#FFBB3E]";
        }
    }

    const [tooltips, setTooltips] = useState(pricing.map(() => Array(5).fill(false)));

    const showTooltip = (pricingIndex: number, featureIndex: number) => {
        setTooltips(prev => {
            const newTooltips = [...prev];
            newTooltips[pricingIndex] = newTooltips[pricingIndex].map((_, index) => index === featureIndex);
            return newTooltips;
        });
    };

    const hideTooltip = (pricingIndex: number) => {
        setTooltips(prev => {
            const newTooltips = [...prev];
            newTooltips[pricingIndex] = newTooltips[pricingIndex].map(() => false);
            return newTooltips;
        });
    };


    const handleUpgrade = (id) => {
        if (!isLogin) {
            localStorage.setItem('plan', id)
            localStorage.setItem('redirect', String(true))
            router.push('/auth/signin')
        } else {
            if (data.name !== "Custom") {
                buyCredit(currentUser?.token, id)
                    .then(response => {
                        queryClient.invalidateQueries('history')
                        if (response.data.data.status === "success") {
                            window.open(response.data.data.Data.checkout_url, '_blank');
                        }
                    })
                    .catch(err => console.log(err));
            } else {
                router.push('/contact')
            }
        }
    };

    const isPurchased = data.name !== 'Custom' ? currentUser?.user?.credits?.find(item => item.bundle_id === data.id) : false

    const getButtonText = () => {
        if (data.name === "Custom") return "Enterprise";
        if (isPurchased) return "Selected Plan";
        return "Select Plan";
    }

    return (
        <>
            <div
                className="w-full lg:w-[30%] border border-gray-300 dark:border-gray-700 flex flex-col justify-between p-[32px] relative isolate rounded-lg"
                key={index}
            >

                {data.name === "Start up" && (<div
                    className="absolute inset-0 -z-10 rounded-[16px] shadow-[0_8px_16px_rgba(255,165,0,0.15)] dark:shadow-[0_8px_16px_rgba(128,128,128,0.7)]"></div>)}

                <div>
                    <div className="flex justify-between items-center">
                        <h5 className="text-[#2E384E] dark:text-white text-[20px] font-semibold">{data.name}</h5>

                        {data.name === "Start up" &&
                            <div
                                className="flex items-center gap-[4px] rounded-[48px] px-[10px] py-[5px] bg-[#E5DFBC] dark:bg-zinc-900 text-[9px] text-[#969173] font-extrabold">
                                <span>👑</span>
                                <h5>Best offer</h5>
                            </div>}
                    </div>

                    <h3 className="text-[#2E384E] dark:text-white text-[44px] font-medium mt-[8px]">
                        {data.name !== "Custom" ? (
                            (<>
                                {data.price} Birr<span className="text-[14px]">/month</span>

                            </> ) ): "Let's talk"}
                    </h3>
                    <p className="text-wrap text-[#62677F] dark:text-gray-400 text-[14px] leading-17 mt-[20px]">{pricing[index].subtitle}</p>

                    <ul className="relative text-[#62677F] dark:text-gray-400 text-[14px] font-semibold leading-17 mt-[30px] mb-[30px] space-y-[12px]">
                        {
                            data.included_call_types.map((feature, featureIndex) => (
                                <div className="relative flex items-center gap-[12px]"
                                     key={featureIndex}>
                                    <Image
                                        className="dark:fill-red-100"
                                        src="/assets/checkmark.svg"
                                        alt="checkmark icon"
                                        width={36}
                                        height={36}
                                    />
                                    <li>{data.call_caps[featureIndex] + " " + feature.charAt(0).toUpperCase() + feature.slice(1).toLowerCase()} calls</li>
                                    {feature.showInfo &&
                                        <div className="relative">
                                            <Image
                                                src="/assets/info.svg"
                                                alt="info icon"
                                                width={20}
                                                height={20}
                                                onMouseEnter={() => showTooltip(index, featureIndex)}
                                                onMouseLeave={() => hideTooltip(index)}
                                            />
                                            {tooltips[index][featureIndex] && (
                                                <div
                                                    className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-24 p-2 bg-red-100 text-xs rounded dark:bg-gray-800 dark:text-white">
                                                    {feature.toolTip}
                                                </div>
                                            )}
                                        </div>
                                    }
                                </div>
                            ))
                        }
                    </ul>
                </div>
                <div
                    className={`group relative w-fit flex items-center gap-[8px] px-[30px] py-[15px] rounded-[8px] ${getButtonColor(data.name)}`}>

                    {
                        data.name === "Custom" && <Image
                            src="/assets/envelope.svg"
                            alt="right arrow icon"
                            width={20}
                            height={20}
                        />
                    }

                    <p
                        onClick={() => handleUpgrade(data.id)}
                        disabled={isPurchased}
                        className="text-[#FFF] cursor-pointer">
                        Choose {data.name} plan</p>

                    {
                        data.name !== "Custom" && <Image
                            className="group-hover:translate-x-1 transition-transform duration-400"
                            src="/assets/right-arrow-white.svg"
                            alt="right arrow icon"
                            width={7}
                            height={12}
                        />
                    }
                </div>
            </div>
        </>
    )
}