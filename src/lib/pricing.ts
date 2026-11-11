import pricingConfigJson from "@/components/scratch_3.json";

export type PricingTier = {
    unitCost?: number;
    tierLowerBound?: number;
    tierUpperBound?: number;
};

export type PricingSku = {
    title: string;
    description?: string;
    info?: string;
    billableEventLabel?: string;
    freeQuota?: number;
    initialValue?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    docsLink?: string;
    tieredPricing: PricingTier[];
};

export const pricingConfig = pricingConfigJson as unknown as Record<string, PricingSku>;

export const DEFAULT_MAX_VALUE = 10_000_000;

export function calculateGooglePrice(numCalls: number, config: PricingSku) {
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

export function getInitialPricingValues() {
    const initial: Record<string, number> = {};
    Object.entries(pricingConfig).forEach(([skuId, config]) => {
        initial[skuId] = config.initialValue || config.minValue || 0;
    });
    return initial;
}

export function clampPricingInput(raw: string, config: PricingSku) {
    const value = parseInt(raw.replace(/,/g, "")) || 0;
    return Math.max(config.minValue || 0, Math.min(config.maxValue || DEFAULT_MAX_VALUE, value));
}

export function formatUsd(price: number) {
    if (price === 0) return "$0";
    return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} USD`;
}

export function formatCompactNumber(num: number) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
}
