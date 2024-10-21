"use client"
import Container from "@/app/components/Container";
import {pricing} from "@/app/constants";
import Image from "next/image";
import Link from "next/link";
import {usePricing} from "@/utils/usePricing";
export default function Page() {
    const {
        getButtonColor,
        tooltips,
        showTooltip,
        hideTooltip
    } = usePricing()

    return (
        <Container>
            <div className="flex flex-col">
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[80px]">GebetaMaps
                    Pricing</h2>
                <div className="flex mt-[45px]">
                    {
                        pricing.map((item, pricingIndex) => (
                            <div
                                className="w-full border-red-500 flex flex-col justify-between p-[32px] relative isolate"
                                key={pricingIndex}>

                                {item.title === "Business" && (<div
                                    className="absolute inset-0 -z-10 rounded-[16px] shadow-[0_8px_16px_rgba(255,165,0,0.15)]"></div>)}

                                <div>

                                    <div className="flex justify-between items-center">
                                        <h5 className="text-[#2E384E] dark:text-white text-[20px] font-semibold">{item.title}</h5>

                                        {item.title === "Business" &&
                                            <div
                                                className="flex items-center gap-[4px] rounded-[48px] px-[10px] py-[5px] bg-[#E5DFBC] dark:bg-zinc-900 text-[9px] text-[#969173] font-extrabold">
                                                <span>👑</span>
                                                <h5>Best offer</h5>
                                            </div>}
                                    </div>

                                    <h3 className="text-[#2E384E] text-[44px] font-medium mt-[8px]">
                                        {item.price}{item.title !== "Enterprise" && (<span
                                            className="text-[14px]">/month</span>
                                    )}
                                    </h3>
                                    <p className="text-wrap text-[#62677F] text-[14px] leading-17 mt-[20px]">{item.subtitle}</p>

                                    <ul className="relative text-[#62677F] text-[14px] font-semibold leading-17 mt-[30px] mb-[30px] space-y-[12px]">
                                        {
                                            item.features.map((feature, featureIndex) => (
                                                <div className="relative flex items-center gap-[12px]"
                                                     key={featureIndex}>
                                                    <Image
                                                        className="dark:fill-red-100"
                                                        src="/assets/checkmark.svg"
                                                        alt="checkmark icon"
                                                        width={36}
                                                        height={36}
                                                    />
                                                    <li>{feature.credit + " " + feature.service} calls</li>
                                                    {feature.showInfo &&
                                                        <div className="relative">
                                                            <Image
                                                                src="/assets/info.svg"
                                                                alt="info icon"
                                                                width={20}
                                                                height={20}
                                                                onMouseEnter={() => showTooltip(pricingIndex, featureIndex)}
                                                                onMouseLeave={() => hideTooltip(pricingIndex)}
                                                            />
                                                            {tooltips[pricingIndex][featureIndex] && (
                                                                <div
                                                                    className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-red-100 text-xs rounded">
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
                                    className={`w-fit flex items-center gap-[8px] px-[30px] py-[15px] rounded-[8px] ${getButtonColor(item.title)}`}>

                                    {
                                        item.title === "Enterprise" && <Image
                                            src="/assets/envelope.svg"
                                            alt="right arrow icon"
                                            width={20}
                                            height={20}
                                        />
                                    }

                                    <Link
                                        href="/"
                                        className="text-[#FFF]">
                                        Choose {item.title} plan</Link>

                                    {
                                        item.title !== "Enterprise" && <Image
                                            src="/assets/right-arrow-white.svg"
                                            alt="right arrow icon"
                                            width={7}
                                            height={12}
                                        />
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </Container>
    )
}