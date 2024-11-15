//@ts-nocheck
"use client";
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRightIcon} from "@radix-ui/react-icons";

const PricingSlider = () => {
    const gebetaRate = 0.02;

    const [sliderValues, setSliderValues] = useState({
        Geocoding: 0,
        Direction: 0,
        ONM: 0,
        TSS: 0,
        Matrix: 0,
    });

    const handleSliderChange = (e, feature) => {
        setSliderValues({
            ...sliderValues,
            [feature]: parseInt(e.target.value)
        });
    };

    const getBackgroundColor = (value) => {
        if (value <= 100) return '#fcf2e9';
        if (value <= 5000) return '#fdbe85';
        if (value <= 10000) return '#fdac63';
        if (value <= 20000) return '#fb9234';
        return '#fd7800';
    };

    const formatPrice = (price, sliderValue) => {
        return sliderValue === 25000 ? (
            <div className="flex items-center gap-2">
                <Link href="/contact" className="text-[14px] text-GebetaMain hover:underline">Contact sales</Link>
                <ArrowRightIcon className="text-sm text-GebetaMain" />
            </div>
        ) : (
            `$${price.toFixed(2)}`
        );
    };

    return (
        <div className="flex justify-center">
            <div className="w-full">
                <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-6 rounded-xl mb-8">
                    <p className="text-md text-gray-700 dark:text-gray-300">
                        The Routes API uses a pay-as-you-go pricing model. The Gebeta maps APIs are billed by usage.
                        Cost is calculated by api call × Price per each use. Use our Pricing and Usage calculator to
                        estimate your usage cost per API.
                    </p>
                </div>

                {Object.keys(sliderValues).map((feature) => (
                    <div key={feature} className="mb-8 bg-white dark:bg-[#111116] p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-lg font-semibold text-[#1B1E2B] dark:text-white">{feature}</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                            <div className="flex-1 mb-4 md:mb-0">
                                <input
                                    type="range"
                                    min="0"
                                    max="25000"
                                    step="100"
                                    value={sliderValues[feature]}
                                    onChange={(e) => handleSliderChange(e, feature)}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${getBackgroundColor(0)} 0%, ${getBackgroundColor(sliderValues[feature])} ${(sliderValues[feature] / 25000) * 100}%, #e5e7eb ${(sliderValues[feature] / 25000) * 100}%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    <span>0</span>
                                    <span>100</span>
                                    <span>5k</span>
                                    <span>10k</span>
                                    <span>20k</span>
                                    <span>25k</span>
                                </div>
                                <p className="text-sm font-bold mt-2 text-[#1B1E2B] dark:text-white">
                                    {sliderValues[feature].toLocaleString()} requests
                                </p>
                            </div>

                            <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-4 rounded-lg min-w-[200px]">
                                <h3 className="text-sm font-semibold mb-1 text-gray-600 dark:text-gray-300">
                                    Estimated Cost
                                </h3>
                                <p className="text-2xl font-bold text-[#1B1E2B] dark:text-white">
                                    {formatPrice(sliderValues[feature] * gebetaRate, sliderValues[feature])}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingSlider;