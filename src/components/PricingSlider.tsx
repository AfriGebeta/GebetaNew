// //@ts-nocheck
// "use client";
// import {useEffect, useState} from 'react';
// import Link from 'next/link';
// import {ArrowRightIcon} from "@radix-ui/react-icons";
// import useGeoLocation from "react-ipgeolocation";
// import Container from "@/sections/Container";
//
// const PricingSlider = () => {
//     const location = useGeoLocation();
//
//     // Define product configurations with their specific free tiers
//     const productConfigs = {
//         Autocomplete: {freeTier: 0, min: 0, unit: "Requests"},
//         ReverseGeocoding: {freeTier: 0, min: 0, unit: "Requests"},
//         Direction: {freeTier: 0, min: 0, unit: "Requests"},
//         Matrix: {freeTier: 0, min: 0, unit: "Requests"},
//         ONM: {freeTier: 0, min: 0, unit: "Requests"},
//         RouteOptimization: {freeTier: 0, min: 0, unit: "Requests"},
//         FleetRouting: {freeTier: 0, min: 0, unit: "Requests"},
//         Tile: {freeTier: 50000, min: 0, unit: "Map Loads"},
//     };
//
//     const [sliderValues, setSliderValues] = useState({
//         Autocomplete: 0,
//         ReverseGeocoding: 0,
//         Direction: 0,
//         Matrix: 0,
//         ONM: 0,
//         RouteOptimization: 0,
//         FleetRouting: 0,
//         Tile: 50000,
//     });
//
//     const [selectedProducts, setSelectedProducts] = useState({});
//     const [exchangeRate, setExchangeRate] = useState(140);
//     const [costExpanded, setCostExpanded] = useState(true);
//
//     useEffect(() => {
//         const fetchExchangeRate = async () => {
//             try {
//                 const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
//                 const data = await response.json();
//                 if (data.rates.ETB) {
//                     setExchangeRate(Math.ceil(data.rates.ETB));
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch exchange rate, using default", error);
//             }
//         };
//
//         fetchExchangeRate();
//     }, []);
//
//     const handleSliderChange = (e, feature) => {
//         setSliderValues({
//             ...sliderValues,
//             [feature]: parseInt(e.target.value)
//         });
//     };
//
//     const handleInputChange = (e, feature) => {
//         let value = parseInt(e.target.value.replace(/,/g, '')) || 0;
//         const max = 10000000;
//         const min = productConfigs[feature].min;
//
//         if (value > max) value = max;
//         if (value < min) value = min;
//
//         setSliderValues({
//             ...sliderValues,
//             [feature]: value
//         });
//     };
//
//     const incrementValue = (feature) => {
//         const currentValue = sliderValues[feature];
//         const step = 25000;
//         const max = 10000000;
//
//         if (currentValue + step <= max) {
//             setSliderValues({
//                 ...sliderValues,
//                 [feature]: currentValue + step
//             });
//         } else if (currentValue < max) {
//             setSliderValues({
//                 ...sliderValues,
//                 [feature]: max
//             });
//         }
//     };
//
//     const decrementValue = (feature) => {
//         const currentValue = sliderValues[feature];
//         const step = 25000;
//         const min = productConfigs[feature].min;
//
//         if (currentValue - step >= min) {
//             setSliderValues({
//                 ...sliderValues,
//                 [feature]: currentValue - step
//             });
//         } else if (currentValue > min) {
//             setSliderValues({
//                 ...sliderValues,
//                 [feature]: min
//             });
//         }
//     };
//
//     const toggleProductSelection = (feature) => {
//         setSelectedProducts(prev => ({
//             ...prev,
//             [feature]: !prev[feature]
//         }));
//     };
//
//     const calculatePrice = (feature, rawCalls) => {
//         const unitsOf1000 = rawCalls / 1000;
//
//         const first20kPricing = {
//             Autocomplete: 2.00,
//             ReverseGeocoding: 3.60,
//             Direction: 3.60,
//             Matrix: 3.60,
//             ONM: 3.60,
//             RouteOptimization: 6.00,
//             FleetRouting: 17.00,
//             Tile: 0.45
//         };
//
//         if (rawCalls <= 20_000 && rawCalls > 0) {
//             if (feature === "Tile") {
//                 if (rawCalls <= 50_000) return 0;
//             } else {
//                 return first20kPricing[feature] * 20;
//             }
//         }
//
//         // Pricing tiers (cost PER 1000 CALLS)
//         const pricingTiers = {
//             Autocomplete: [
//                 {range: [0, 100], price: 2},       // $2 per 1000 for 0-100k calls
//                 {range: [100, 500], price: 1.589}, // $1.589 per 1000 for 100k-500k
//                 {range: [500, 1000], price: 1.19}, // $1.19 per 1000 for 500k-1M
//                 {range: [1000, 5000], price: 0.595}, // $0.595 per 1000 for 1M-5M
//                 {range: [5000, 10000], price: 0.147} // $0.147 per 1000 for 5M-10M
//             ],
//             ReverseGeocoding: [
//                 {range: [0, 100], price: 3.6},
//                 {range: [100, 500], price: 2.48},
//                 {range: [500, 1000], price: 1.86},
//                 {range: [1000, 5000], price: 0.93},
//                 {range: [5000, 10000], price: 0.2356}
//             ],
//             Direction: [
//                 {range: [0, 100], price: 3.6},
//                 {range: [100, 500], price: 2.48},
//                 {range: [500, 1000], price: 1.86},
//                 {range: [1000, 5000], price: 0.93},
//                 {range: [5000, 10000], price: 0.2356}
//             ],
//             Matrix: [
//                 {range: [0, 100], price: 3.6},
//                 {range: [100, 500], price: 2.2},
//                 {range: [500, 1000], price: 1.65},
//                 {range: [1000, 5000], price: 0.825},
//                 {range: [5000, 10000], price: 0.209}
//             ],
//             ONM: [
//                 {range: [0, 100], price: 3.6},
//                 {range: [100, 500], price: 2.2},
//                 {range: [500, 1000], price: 1.65},
//                 {range: [1000, 5000], price: 0.825},
//                 {range: [5000, 10000], price: 0.209}
//             ],
//             RouteOptimization: [
//                 {range: [0, 100], price: 6},
//                 {range: [100, 500], price: 2.2},
//                 {range: [500, 1000], price: 1.1},
//                 {range: [1000, 5000], price: 0.44},
//                 {range: [5000, 10000], price: 0.385}
//             ],
//             FleetRouting: [
//                 {range: [0, 100], price: 17},
//                 {range: [100, 500], price: 7.7},
//                 {range: [500, 1000], price: 3.3},
//                 {range: [1000, 5000], price: 1.32},
//                 {range: [5000, 10000], price: 1.155}
//             ],
//             Tile: [
//                 { range: [0, 50], price: 0 },
//                 { range: [50, 100], price: 0.45 },
//                 { range: [100, 250], price: 1.8 },
//                 { range: [250, 500], price: 3.0 },
//                 { range: [500, 1000], price: 4 },
//                 { range: [1000, 2000], price: 3.2 },
//                 { range: [2000, 3500], price: 2.0 },
//                 { range: [3500, 5000], price: 1.0 },
//                 { range: [5000, 10000], price: 0.252 },
//                 { range: [10000, 50000], price: 0.226 },
//                 { range: [50000, 100000], price: 0.0315}
//             ]
//         };
//
//         // Special conditions (thresholds in units of 1000 calls)
//         const specialConditions = {
//             Autocomplete: {threshold: 150, adjustedPrice: 1.981}, // 150k calls
//             ReverseGeocoding: {threshold: 150, adjustedPrice: 3.1},
//             Direction: {threshold: 150, adjustedPrice: 3.1},
//             Matrix: {threshold: 150, adjustedPrice: 2.75},
//             ONM: {threshold: 150, adjustedPrice: 2.75},
//             RouteOptimization: {threshold: 150, adjustedPrice: 5.5},
//             FleetRouting: {threshold: 150, adjustedPrice: 16.5},
//             Tile: {threshold: 1500, adjustedPrice: 0.42}
//         };
//
//         let totalCost = 0;
//         let remainingUnits = unitsOf1000;
//
//         // Apply special condition if applicable
//         if (specialConditions[feature] && unitsOf1000 > specialConditions[feature].threshold) {
//             const firstTier = pricingTiers[feature][0];
//             const tierRange = firstTier.range[1] - firstTier.range[0];
//             const unitsInTier = Math.min(remainingUnits, tierRange);
//
//             totalCost += unitsInTier * specialConditions[feature].adjustedPrice;
//             remainingUnits -= unitsInTier;
//         }
//
//         // Calculate remaining tiers
//         for (let i = 0; i < pricingTiers[feature].length && remainingUnits > 0; i++) {
//             const tier = pricingTiers[feature][i];
//
//             // Skip first tier if special condition was applied
//             if (i === 0 && specialConditions[feature] && unitsOf1000 > specialConditions[feature].threshold) {
//                 continue;
//             }
//
//             const tierMin = tier.range[0];
//             const tierMax = tier.range[1];
//             const tierRange = tierMax - tierMin;
//             const unitsInTier = Math.min(remainingUnits, tierRange);
//
//             if (unitsInTier > 0) {
//                 totalCost += unitsInTier * tier.price;
//                 remainingUnits -= unitsInTier;
//             }
//         }
//
//         return totalCost;
//     };
//
//     const formatPrice = (price, sliderValue) => {
//         if (sliderValue === 10_000_000) {
//             return (
//                 <div className="flex items-center gap-2 h-10 ">
//                     <Link href="/contact" className="text-[14px] text-GebetaMain hover:underline">
//                         Contact sales
//                     </Link>
//                     <ArrowRightIcon className="text-sm text-GebetaMain"/>
//                 </div>
//             );
//         }
//
//         if (price === 0) return "$0";
//
//         const usdPrice = price.toFixed(2);
//         return `$${parseFloat(usdPrice).toLocaleString()} USD`;
//     };
//
//     const hasFreeTier = (feature, value) => {
//         const freeQuota = productConfigs[feature].freeTier;
//         return value <= freeQuota && freeQuota > 0;
//     };
//
//     const calculateTotalCost = () => {
//         let total = 0;
//         Object.keys(selectedProducts).forEach(feature => {
//             if (selectedProducts[feature]) {
//                 total += calculatePrice(feature, sliderValues[feature]);
//             }
//         });
//         return total;
//     };
//
//     const formatNumber = (num) => {
//         if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
//         if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
//         return num.toString();
//     };
//
//     const resetAll = () => {
//         setSelectedProducts({});
//         setSliderValues({
//             Autocomplete: 0,
//             ReverseGeocoding: 0,
//             Direction: 0,
//             Matrix: 0,
//             ONM: 0,
//             RouteOptimization: 0,
//             FleetRouting: 0,
//             Tile: 0,
//         });
//     };
//
//     return (
//         <Container>
//             <div className="flex flex-col md:flex-row justify-between gap-8 mb-40">
//                 <div className="w-full">
//                     <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-6 rounded-xl mb-8">
//                         <p className="text-md text-gray-700 dark:text-gray-300">
//                             The Routes API uses a pay-as-you-go pricing model. The Gebeta maps APIs are billed by usage.
//                             Cost is calculated using tiered pricing based on usage volume. Use our Pricing and Usage
//                             calculator to
//                             estimate your usage cost per API.
//                         </p>
//                     </div>
//
//                     <div className="w-full grid grid-cols-1 gap-6">
//                         {Object.keys(sliderValues).map((feature) => {
//                             const max = 10000000;
//                             const min = productConfigs[feature].min;
//                             const freeQuota = productConfigs[feature].freeTier;
//                             const price = calculatePrice(feature, sliderValues[feature]);
//                             const isSelected = selectedProducts[feature];
//                             const unit = productConfigs[feature].unit;
//
//                             return (
//                                 <div className="relative h-fit space-y-2">
//                                     {/*<div className="bg-red-900 h-[200px] w-10 absolute -left-10">*/}
//                                     {/*</div>*/}
//                                     <div key={feature}
//                                          className="relative mb-6 bg-white dark:bg-[#111116] px-6 py-4 rounded-xl w-full border 'border-gray-200 dark:border-gray-800">
//                                         <div
//                                             className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//                                             <div className="mb-4 md:mb-0">
//                                                 <div
//                                                     className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
//                                                     {/*{feature === "ONM" ? "Places" : feature === "Tile" ? "Maps" : feature.replace(/([A-Z])/g, ' $1').trim()}*/}
//                                                 </div>
//                                                 <div className="text-lg font-semibold text-[#1B1E2B] dark:text-white">
//                                                     <Link
//                                                         href="#"
//                                                         target="_blank"
//                                                         className="hover:underline text-[#1B1E2B]]"
//                                                     >
//                                                         {feature === "ONM" ? "Places API" :
//                                                             feature === "Tile" ? "Maps" :
//                                                                 feature.replace(/([A-Z])/g, ' $1').trim()}
//                                                     </Link>
//                                                 </div>
//                                             </div>
//
//                                             <div className="flex items-center gap-4 h-4">
//                                                 <div className="text-right">
//                                                     <div className="text-2xl font-bold text-[#1B1E2B] dark:text-white">
//                                                         {formatPrice(price, sliderValues[feature])}
//                                                     </div>
//                                                     {/*<div className="text-sm text-gray-500 dark:text-gray-400">*/}
//                                                     {/*    per month (estimate)*/}
//                                                     {/*</div>*/}
//                                                 </div>
//                                                 {/*<button*/}
//                                                 {/*    className={`px-4 py-2 rounded text-sm font-medium ${isSelected ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white' : 'bg-[#1A73E8] text-white hover:bg-blue-700'}`}*/}
//                                                 {/*    onClick={() => toggleProductSelection(feature)}*/}
//                                                 {/*>*/}
//                                                 {/*    {isSelected ? 'Remove' : 'Add'}*/}
//                                                 {/*</button>*/}
//                                             </div>
//                                         </div>
//
//                                         <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
//                                             <div className="flex flex-col md:flex-row md:items-center gap-4">
//                                                 <div className="flex-1">
//                                                     <div className="relative mb-1 flex items-center">
//                                                         {freeQuota > 0 && (
//                                                             <>
//                                                                 <div
//                                                                     className="h-[8px] bg-green-500 mt-1 rounded-l-lg flex-shrink-0 z-20 w-[40%] md:w-[25%] lg:w-[25%]"
//                                                                 ></div>
//                                                                 <div
//                                                                     className="text-xs text-gray-600 mt-1 absolute top-[130%] left-[38%] md:left-[24%]">
//                                                                     {formatNumber(freeQuota).toLocaleString()}
//                                                                 </div>
//                                                                 <div
//                                                                     className="flex flex-col items-start absolute top-8 left-[4%]">
//                                                                     <div
//                                                                         className="text-xs text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded-mds">
//                                                                         Included
//                                                                     </div>
//                                                                 </div>
//                                                             </>
//                                                         )}
//
//                                                         <div className="flex-grow relative">
//                                                             <input
//                                                                 type="range"
//                                                                 min={min}
//                                                                 max={max}
//                                                                 step="25000"
//                                                                 value={sliderValues[feature]}
//                                                                 onChange={(e) => handleSliderChange(e, feature)}
//                                                                 className="custom-range z-1000 w-full h-2 mt-0 bg-gray-200 rounded-r-lg appearance-none cursor-pointer dark:bg-gray-700"
//                                                                 style={{
//                                                                     background: `linear-gradient(to right,
//             #1A73E8 0%,
//             #1A73E8 ${((sliderValues[feature] - (freeQuota > 0 ? freeQuota : 0)) / (max - (freeQuota > 0 ? freeQuota : 0))) * 100}%,
//             #e5e7eb ${((sliderValues[feature] - (freeQuota > 0 ? freeQuota : 0)) / (max - (freeQuota > 0 ? freeQuota : 0))) * 100}%)`
//                                                                 }}
//                                                             />
//                                                         </div>
//                                                     </div>
//
//                                                     <div
//                                                         className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-400">
//                                                         <span>0</span>
//                                                         <span>10M</span>
//                                                     </div>
//
//                                                 </div>
//
//                                                 <div className="flex flex-col items-center">
//                                                     <div className="relative">
//                                                         <input
//                                                             type="text"
//                                                             value={sliderValues[feature].toLocaleString()}
//                                                             onChange={(e) => handleInputChange(e, feature)}
//                                                             className="w-32 px-3 py-2 border border-gray-300 rounded text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
//                                                         />
//                                                         <div className="absolute right-1 top-0.5 flex flex-col">
//                                                             <button
//                                                                 onClick={() => incrementValue(feature)}
//                                                                 className="h-3 w-5 flex items-center justify-center rounded-t hover:bg-gray-100 dark:hover:bg-gray-700"
//                                                                 tabIndex={0}
//                                                             >
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="6"
//                                                                      height="3" viewBox="0 0 6 3" fill="none">
//                                                                     <path d="M3 0L0 3H6L3 0Z" fill="#3C4043"></path>
//                                                                 </svg>
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => decrementValue(feature)}
//                                                                 className="h-3 w-5 flex items-center justify-center rounded-b hover:bg-gray-100 dark:hover:bg-gray-700"
//                                                                 tabIndex={0}
//                                                             >
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="6"
//                                                                      height="3" viewBox="0 0 6 3" fill="none">
//                                                                     <path d="M3 3L6 0L-2.62268e-07 5.24537e-07L3 3Z"
//                                                                           fill="#3C4043"></path>
//                                                                 </svg>
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                     <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                                                         {unit}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//
//
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//
//
//             </div>
//         </Container>
//
//     );
// };
//
// export default PricingSlider;


//@ts-nocheck
"use client";
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

const PricingSlider = () => {


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
                    <ArrowRightIcon className="text-sm text-GebetaMain"/>
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

    return (
        <Container>
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-40">
                <div className="w-full">

                    <div className="bg-[#FFA500]/5 dark:bg-[#FFA500]/10 p-6 rounded-xl mb-8">
                        <p className="text-md text-gray-700 dark:text-gray-300">
                            The Routes API uses a pay-as-you-go pricing model. The Gebeta maps APIs are billed by usage.
                            Cost is calculated using tiered pricing based on usage volume. Use our Pricing and Usage
                            calculator to estimate your usage cost per API.
                        </p>
                    </div>


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
                                                        min={minValue}
                                                        max={maxValue}
                                                        step={step}
                                                        value={currentValue}
                                                        onChange={(e) => handleSliderChange(e, skuId)}
                                                        className="custom-range z-1000 w-full h-2 mt-0 bg-gray-200 rounded appearance-none cursor-pointer dark:bg-gray-700"
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
                                                                <path d="M3 0L0 3H6L3 0Z" fill="#3C4043"/>
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
                                                                <path d="M3 3L6 0L0 0L3 3Z" fill="#3C4043"/>
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
        </Container>
    );
};

export default PricingSlider;
