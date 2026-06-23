//@ts-nocheck
"use client";
import React from "react";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Container from "@/sections/Container";
import pricingConfig from "./scratch_3.json";

function calculateGooglePrice(numCalls, config) {
    const { tieredPricing, freeQuota = 0 } = config;
    if (!tieredPricing?.length) return 0;

    const firstTierRate = tieredPricing[0]?.unitCost || 0;
    let remaining = numCalls;
    let totalCost = 0;

    for (const tier of tieredPricing) {
        if (remaining <= 0) break;
        const { unitCost, tierLowerBound = 0, tierUpperBound = Infinity } = tier;
        if (unitCost === undefined) continue;

        const callsInTier = Math.min(remaining, Math.max(0, tierUpperBound - tierLowerBound));
        if (callsInTier > 0) {
            totalCost += (callsInTier / 1000) * unitCost;
            remaining -= callsInTier;
        }
    }

    const freeUsed = Math.min(numCalls, freeQuota);
    const credit = (freeQuota > 0) ? (freeUsed / 1000) * firstTierRate : 0;
    return Math.round(Math.max(0, totalCost - credit) * 100) / 100;
}

const PricingSlider = ({ isComponent }: { isComponent?: boolean }) => {
    const [sliderValues, setSliderValues] = useState(() => {
        const initial = {};
        Object.entries(pricingConfig).forEach(([skuId, config]) => {
            initial[skuId] = config.initialValue || config.minValue || 0;
        });
        return initial;
    });


    const handleSliderChange = (e, skuId) => {
        setSliderValues(prev => ({ ...prev, [skuId]: parseInt(e.target.value) }));
    };


    const handleInputChange = (e, skuId) => {
        const config = pricingConfig[skuId];
        let value = parseInt(e.target.value.replace(/,/g, '')) || 0;
        value = Math.max(config.minValue || 0, Math.min(config.maxValue || 10_000_000, value));
        setSliderValues(prev => ({ ...prev, [skuId]: value }));
    };


    const formatPrice = (price, value, maxValue) => {
        if (value >= maxValue) {
            return (
                <div className="flex items-center gap-2 h-10">
                    <Link href="/contact" className="text-[14px] text-GebetaMain hover:underline">
                        Contact sales
                    </Link>
                    <ArrowRightIcon className="text-sm text-GebetaMain" />
                </div>
            );
        }
        if (price === 0) return "$0";
        return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} USD`;
    };


    const formatNumber = (num) => {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        return num.toLocaleString();
    };

    const Wrapper = isComponent ? React.Fragment : Container;

    return (
        <Wrapper>
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-40">
                <div className="w-full">
                    {!isComponent && <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-6 rounded-xl mb-8">
                        <p className="text-md text-gray-700 dark:text-gray-300">
                            The Routes API uses a pay-as-you-go pricing model. The Gebeta maps APIs are billed by usage.
                            Cost is calculated using tiered pricing based on usage volume. Use our Pricing and Usage
                            calculator to estimate your usage cost per API.
                        </p>
                    </div>}


                    <div className="w-full grid grid-cols-1 gap-6">
                        {Object.entries(pricingConfig).map(([skuId, config]) => {
                            const {
                                title,
                                description,
                                freeQuota = 0,
                                minValue = 0,
                                maxValue = 10_000_000,
                                step = 1,
                                billableEventLabel = "Requests",
                                docsLink
                            } = config;

                            const currentValue = sliderValues[skuId] || 0;
                            const price = calculateGooglePrice(currentValue, config);
                            const hasFreeTier = freeQuota > 0 && currentValue <= freeQuota;

                            return (
                                <div key={skuId} className="relative mb-6 bg-white dark:bg-[#111116] px-6 py-4 rounded-xl w-full border border-gray-200 dark:border-gray-800">


                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                        <div className="mb-4 md:mb-0">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                {billableEventLabel}
                                            </div>
                                            <div className="text-lg font-semibold text-[#1B1E2B] dark:text-white">
                                                {docsLink ? (
                                                    <Link href={docsLink} target="_blank" className="hover:underline text-[#1B1E2B]">
                                                        {title}
                                                    </Link>
                                                ) : title}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[#1B1E2B] dark:text-white">
                                                {formatPrice(price, currentValue, maxValue)}
                                            </div>
                                        </div>
                                    </div>


                                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">


                                            <div className="flex-1">
                                                <div className="relative mb-1 flex items-center">
                                                    {freeQuota > 0 && (
                                                        <>
                                                            <div className="h-[8px] bg-green-500 mt-1 rounded-l-lg flex-shrink-0 z-20 w-[25%]"></div>
                                                            <div className="text-xs text-gray-600 mt-1 absolute top-[130%] left-[24%]">
                                                                {formatNumber(freeQuota)}
                                                            </div>
                                                            <div className="flex flex-col items-start absolute top-8 left-[4%]">
                                                                <div className="text-xs text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded">
                                                                    Included
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <input
                                                        type="range"
                                                        min={freeQuota > 0 ? freeQuota : minValue}
                                                        max={maxValue}
                                                        step={step}
                                                        value={currentValue}
                                                        onChange={(e) => handleSliderChange(e, skuId)}
                                                        className="custom-range z-1000 w-full h-2 mt-1 bg-gray-200 appearance-none cursor-pointer dark:bg-gray-700"
                                                        style={{
                                                            background: `linear-gradient(to right, 
                                #1A73E8 0%, 
                                #1A73E8 ${((currentValue - (freeQuota > 0 ? freeQuota : 0)) / (maxValue - (freeQuota > 0 ? freeQuota : 0))) * 100}%, 
                                #e5e7eb ${((currentValue - (freeQuota > 0 ? freeQuota : 0)) / (maxValue - (freeQuota > 0 ? freeQuota : 0))) * 100}%)`
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-400">
                                                    <span>{formatNumber(minValue)}</span>
                                                    <span>{formatNumber(maxValue)}</span>
                                                </div>
                                            </div>

                                            {/* Number Input */}
                                            <div className="flex flex-col items-center">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={currentValue.toLocaleString()}
                                                        onChange={(e) => handleInputChange(e, skuId)}
                                                        className="w-32 px-3 py-2 border border-gray-300 rounded text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                                                    />
                                                    <div className="absolute right-1 top-0.5 flex flex-col">
                                                        <button
                                                            onClick={() => setSliderValues(prev => ({
                                                                ...prev,
                                                                [skuId]: Math.min(maxValue, (prev[skuId] || 0) + step)
                                                            }))}
                                                            className="h-3 w-5 flex items-center justify-center rounded-t hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="3" viewBox="0 0 6 3" fill="none">
                                                                <path d="M3 0L0 3H6L3 0Z" fill="#3C4043" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setSliderValues(prev => ({
                                                                ...prev,
                                                                [skuId]: Math.max(minValue, (prev[skuId] || 0) - step)
                                                            }))}
                                                            className="h-3 w-5 flex items-center justify-center rounded-b hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="3" viewBox="0 0 6 3" fill="none">
                                                                <path d="M3 3L6 0L0 0L3 3Z" fill="#3C4043" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {billableEventLabel}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};

export default PricingSlider;
