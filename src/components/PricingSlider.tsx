//@ts-nocheck
"use client";
import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ArrowRightIcon} from "@radix-ui/react-icons";
import useGeoLocation from "react-ipgeolocation";

const PricingSlider = () => {
    const location = useGeoLocation();

    const [sliderValues, setSliderValues] = useState({
        Autocomplete: 0,
        ReverseGeocoding: 0,
        Direction: 0,
        Matrix: 0,
        ONM: 0,
        RouteOptimization: 0,
        FleetRouting: 0,
        Tile: 0,
    });

    const sliderSteps = [
        { value: 0, position: '0%' },
        { value: 1000, position: '10%' },
        { value: 5000, position: '50%' },
        { value: 10000, position: '100%' }
    ];

    const [exchangeRate, setExchangeRate] = useState(140);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                if (data.rates.ETB) {
                    setExchangeRate(Math.ceil(data.rates.ETB));
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate, using default", error);
            }
        };

        fetchExchangeRate();
    }, []);

    const handleSliderChange = (e, feature) => {
        setSliderValues({
            ...sliderValues,
            [feature]: parseInt(e.target.value)
        });
    };

    const getSliderSteps = () => [
        { value: 0, label: "0", position: '0%' },
        { value: 100000, label: "100k", position: '10%' },
        { value: 250000, label: "250k", position: '25%' },
        { value: 500000, label: "500k", position: '50%' },
        { value: 750000, label: "750k", position: '75%' },
        { value: 1000000, label: "1M", position: '100%' }
    ];

    const getBackgroundColor = (value) => {
        const percentage = (value / 1000000) * 100;

        if (percentage <= 10) return '#fcf2e9';
        if (percentage <= 25) return '#fdbe85';
        if (percentage <= 50) return '#fdac63';
        if (percentage <= 75) return '#fb9234';
        return '#fd7800';
    };

    const calculatePrice = (feature, rawCalls) => {
        const unitsOf1000 = rawCalls / 1000;

        const first20kPricing = {
            Autocomplete: 2.00,
            ReverseGeocoding: 3.60,
            Direction: 3.60,
            Matrix: 3.60,
            ONM: 3.60,
            RouteOptimization: 6.00,
            FleetRouting: 17.00,
            Tile: 0.45
        };

        if(rawCalls <= 20_000 && rawCalls > 0) {
            if(feature === "Tile") {
                if(rawCalls <= 50_000) return 0;
            } else {
                return first20kPricing[feature] * 20;
            }
        }

        // Pricing tiers (cost PER 1000 CALLS)
        const pricingTiers = {
            Autocomplete: [
                { range: [0, 100], price: 2 },       // $2 per 1000 for 0-100k calls
                { range: [100, 500], price: 1.589 }, // $1.589 per 1000 for 100k-500k
                { range: [500, 1000], price: 1.19 }, // $1.19 per 1000 for 500k-1M
                { range: [1000, 5000], price: 0.595 }, // $0.595 per 1000 for 1M-5M
                { range: [5000, 10000], price: 0.147 } // $0.147 per 1000 for 5M-10M
            ],
            ReverseGeocoding: [
                { range: [0, 100], price: 3.6 },
                { range: [100, 500], price: 2.48 },
                { range: [500, 1000], price: 1.86 },
                { range: [1000, 5000], price: 0.93 },
                { range: [5000, 10000], price: 0.2356 }
            ],
            Direction: [
                { range: [0, 100], price: 3.6 },
                { range: [100, 500], price: 2.48 },
                { range: [500, 1000], price: 1.86 },
                { range: [1000, 5000], price: 0.93 },
                { range: [5000, 10000], price: 0.2356 }
            ],
            Matrix: [
                { range: [0, 100], price: 3.6 },
                { range: [100, 500], price: 2.2 },
                { range: [500, 1000], price: 1.65 },
                { range: [1000, 5000], price: 0.825 },
                { range: [5000, 10000], price: 0.209 }
            ],
            ONM: [
                { range: [0, 100], price: 3.6 },
                { range: [100, 500], price: 2.2 },
                { range: [500, 1000], price: 1.65 },
                { range: [1000, 5000], price: 0.825 },
                { range: [5000, 10000], price: 0.209 }
            ],
            RouteOptimization: [
                { range: [0, 100], price: 6 },
                { range: [100, 500], price: 2.2 },
                { range: [500, 1000], price: 1.1 },
                { range: [1000, 5000], price: 0.44 },
                { range: [5000, 10000], price: 0.385 }
            ],
            FleetRouting: [
                { range: [0, 100], price: 17 },
                { range: [100, 500], price: 7.7 },
                { range: [500, 1000], price: 3.3 },
                { range: [1000, 5000], price: 1.32 },
                { range: [5000, 10000], price: 1.155 }
            ],
            Tile: [
                { range: [0, 50], price: 0 },
                { range: [50, 100], price: 0.45 },
                { range: [100, 500], price: 0.45 },
                { range: [500, 1000], price: 0.45 },
                { range: [1000, 5000], price: 0.336 },
                { range: [5000, 10000], price: 0.252 },
                { range: [10000, 50000], price: 0.126 },
                { range: [50000, 100000], price: 0.0315 }
            ]
        };

        // Special conditions (thresholds in units of 1000 calls)
        const specialConditions = {
            Autocomplete: { threshold: 150, adjustedPrice: 1.981 }, // 150k calls
            ReverseGeocoding: { threshold: 150, adjustedPrice: 3.1 },
            Direction: { threshold: 150, adjustedPrice: 3.1 },
            Matrix: { threshold: 150, adjustedPrice: 2.75 },
            ONM: { threshold: 150, adjustedPrice: 2.75 },
            RouteOptimization: { threshold: 150, adjustedPrice: 5.5 },
            FleetRouting: { threshold: 150, adjustedPrice: 16.5 },
            Tile: { threshold: 1500, adjustedPrice: 0.42 }
        };

        let totalCost = 0;
        let remainingUnits = unitsOf1000;


        // Apply special condition if applicable
        if (specialConditions[feature] && unitsOf1000 > specialConditions[feature].threshold) {
            const firstTier = pricingTiers[feature][0];
            const tierRange = firstTier.range[1] - firstTier.range[0];
            const unitsInTier = Math.min(remainingUnits, tierRange);

            totalCost += unitsInTier * specialConditions[feature].adjustedPrice;
            remainingUnits -= unitsInTier;
        }

        // Calculate remaining tiers
        for (let i = 0; i < pricingTiers[feature].length && remainingUnits > 0; i++) {
            const tier = pricingTiers[feature][i];

            // Skip first tier if special condition was applied
            if (i === 0 && specialConditions[feature] && unitsOf1000 > specialConditions[feature].threshold) {
                continue;
            }

            const tierMin = tier.range[0];
            const tierMax = tier.range[1];
            const tierRange = tierMax - tierMin;
            const unitsInTier = Math.min(remainingUnits, tierRange);

            if (unitsInTier > 0) {
                totalCost += unitsInTier * tier.price;
                remainingUnits -= unitsInTier;
            }
        }

        return totalCost;
    };
    const formatPrice = (price, sliderValue) => {
        if (sliderValue === 10_000_000) {
            return (
                <div className="flex items-center gap-2">
                    <Link href="/contact" className="text-[14px] text-GebetaMain hover:underline">
                        Contact sales
                    </Link>
                    <ArrowRightIcon className="text-sm text-GebetaMain"/>
                </div>
            );
        }


        const usdPrice = price.toFixed(2);
        return `$${usdPrice?.toLocaleString()} USD`;
    };

    return (
        <div className="flex justify-center">
            <div className="w-full">
                <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-6 rounded-xl mb-8">
                    <p className="text-md text-gray-700 dark:text-gray-300">
                        The Routes API uses a pay-as-you-go pricing model. The Gebeta maps APIs are billed by usage.
                        Cost is calculated using tiered pricing based on usage volume. Use our Pricing and Usage calculator to
                        estimate your usage cost per API.
                    </p>
                </div>

                {Object.keys(sliderValues).map((feature) => {
                    const steps = getSliderSteps(feature);
                    const max = 10_000_000;

                    return (
                        <div key={feature} className="mb-8 bg-white dark:bg-[#111116] p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg font-semibold text-[#1B1E2B] dark:text-white">
                                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                <div className="flex-1 mb-4 md:mb-0">
                                    <input
                                        type="range"
                                        min="0"
                                        max={max}
                                        value={sliderValues[feature]}
                                        onChange={(e) => handleSliderChange(e, feature)}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${getBackgroundColor(0, feature)} 0%, ${getBackgroundColor(sliderValues[feature], feature)} ${(sliderValues[feature] / max) * 100}%, #e5e7eb ${(sliderValues[feature] / max) * 100}%)`,
                                        }}
                                    />
                                    <div className="relative w-full mt-2">
                                        {steps.map((step) => (
                                            <span
                                                key={step.value}
                                                className="absolute text-xs text-gray-500 dark:text-gray-400 -translate-x-1/2"
                                                style={{ left: step.position }}
                                            >
                                {step.label}
                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm font-bold mt-6 text-[#1B1E2B] dark:text-white">
                                        {sliderValues[feature].toLocaleString()} requests
                                    </p>
                                </div>

                                <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-4 rounded-lg min-w-[200px]">
                                    <h3 className="text-sm font-semibold mb-1 text-gray-600 dark:text-gray-300">
                                        Estimated Cost
                                    </h3>
                                    <p className="text-2xl font-bold text-[#1B1E2B] dark:text-white">
                                        {formatPrice(calculatePrice(feature, sliderValues[feature]), sliderValues[feature])}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )})}
            </div>
        </div>
    );
};

export default PricingSlider;