import {useState} from "react";
import {pricing} from "../constants";

export const usePricing = () => {
    const getButtonColor = (title: string) => {
        switch (title) {
            case "Individual":
                return "bg-[#FFBB3E]";
            case "Business":
                return "bg-[#FFA500]";
            case "Enterprise":
                return "bg-[#2E384E]";
            default:
                return "bg-[#FFBB3E]";
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

    return {
        getButtonColor,
        tooltips,
        showTooltip,
        hideTooltip
    };
}