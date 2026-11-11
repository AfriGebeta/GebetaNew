"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MAX_VALUE,
  calculateGooglePrice,
  clampPricingInput,
  formatCompactNumber,
  formatUsd,
  getInitialPricingValues,
  pricingConfig,
  type PricingSku,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import Tag from "@/components/ui/tag";
import { Input } from "@/components/ui/input";
import { Range } from "@/components/ui/range";

type SkuRowProps = {
  skuId: string;
  config: PricingSku;
  value: number;
  onChange: (value: number) => void;
};

function SkuRow({ skuId, config, value, onChange }: SkuRowProps) {
  const {
    title,
    freeQuota = 0,
    minValue = 0,
    maxValue = DEFAULT_MAX_VALUE,
    step = 1,
    billableEventLabel = "Requests",
    docsLink,
  } = config;

  const price = calculateGooglePrice(value, config);
  const atMax = value >= maxValue;
  const rangeMin = freeQuota > 0 ? freeQuota : minValue;
  const inputId = `pricing-${skuId.replace(/\s+/g, "-")}`;

  return (
    <li className="flex flex-col gap-5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="eyebrow-style text-subtle">{billableEventLabel}</span>
          {docsLink ? (
            <Link
              href={docsLink}
              target="_blank"
              className="h3-style inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              {title}
              <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
            </Link>
          ) : (
            <span className="h3-style font-medium text-foreground">{title}</span>
          )}
        </div>
        {atMax ? (
          <Button variant="secondary" href="/contact" className="shrink-0">
            Contact sales <ArrowRight aria-hidden />
          </Button>
        ) : (
          <span
            aria-live="polite"
            className={cn(
              "shrink-0 text-[20px] font-medium leading-none tabular-nums tracking-[-0.01em]",
              price === 0 ? "text-soft" : "text-foreground",
            )}
          >
            {formatUsd(price)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-3">
          <div className="flex items-center">
            {freeQuota > 0 && (
              <span aria-hidden className="h-1.5 w-1/4 shrink-0 rounded-l-full bg-success" />
            )}
            <Range
              aria-label={`${title} ${billableEventLabel.toLowerCase()}`}
              aria-valuetext={`${value.toLocaleString()} ${billableEventLabel.toLowerCase()}`}
              min={rangeMin}
              max={maxValue}
              step={step}
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value))}
              className={cn(freeQuota > 0 && "rounded-l-none")}
            />
          </div>
          <div className="caption-style relative flex h-[22px] items-start justify-between tabular-nums text-subtle">
            <span>{formatCompactNumber(minValue)}</span>
            {freeQuota > 0 && (
              <>
                <Tag size="sm" tone="green" className="absolute left-[3%] top-0">
                  Included
                </Tag>
                <span className="absolute left-1/4 top-0 -translate-x-1/2">
                  {formatCompactNumber(freeQuota)}
                </span>
              </>
            )}
            <span>{formatCompactNumber(maxValue)}</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="relative">
            <Input
              id={inputId}
              inputMode="numeric"
              aria-label={`${title} ${billableEventLabel.toLowerCase()} amount`}
              value={value.toLocaleString()}
              onChange={(e) => onChange(clampPricingInput(e.target.value, config))}
              className="w-36 pr-8 text-right tabular-nums"
            />
            <div className="absolute inset-y-1 right-1 flex flex-col">
              <button
                type="button"
                aria-label={`Increase ${title}`}
                onClick={() => onChange(Math.min(maxValue, value + step))}
                className="flex flex-1 items-center justify-center rounded-t-md px-1 text-subtle transition-colors duration-150 ease-power3-out hover:bg-hover hover:text-foreground"
              >
                <ChevronUp aria-hidden className="size-3" />
              </button>
              <button
                type="button"
                aria-label={`Decrease ${title}`}
                onClick={() => onChange(Math.max(minValue, value - step))}
                className="flex flex-1 items-center justify-center rounded-b-md px-1 text-subtle transition-colors duration-150 ease-power3-out hover:bg-hover hover:text-foreground"
              >
                <ChevronDown aria-hidden className="size-3" />
              </button>
            </div>
          </div>
          <label htmlFor={inputId} className="caption-style text-subtle">
            {billableEventLabel}
          </label>
        </div>
      </div>
    </li>
  );
}

export default function PricingCalculator({ className }: { className?: string }) {
  const [values, setValues] = useState(getInitialPricingValues);
  const entries = Object.entries(pricingConfig);

  const needsSales = entries.some(
    ([skuId, config]) => (values[skuId] || 0) >= (config.maxValue ?? DEFAULT_MAX_VALUE),
  );
  const total = entries.reduce((sum, [skuId, config]) => {
    const value = values[skuId] || 0;
    if (value >= (config.maxValue ?? DEFAULT_MAX_VALUE)) return sum;
    return sum + calculateGooglePrice(value, config);
  }, 0);

  return (
    <div className={cn("overflow-hidden rounded-lg bg-card shadow-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-strong p-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow-style text-subtle">Estimated total</span>
          <span className="text-[22px] font-medium leading-none tabular-nums tracking-[-0.01em] text-foreground">
            {formatUsd(Math.round(total * 100) / 100)}
            {needsSales && <span className="caption-style ml-2 text-soft">+ custom volume</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="caption-style max-w-[28em] leading-[1.4] text-subtle">
            Pay as you go, billed by usage with tiered pricing per API.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setValues(getInitialPricingValues())}>
            <RotateCcw aria-hidden /> Reset
          </Button>
        </div>
      </div>
      <ul className="divide-y divide-line-strong">
        {entries.map(([skuId, config]) => (
          <SkuRow
            key={skuId}
            skuId={skuId}
            config={config}
            value={values[skuId] || 0}
            onChange={(value) => setValues((prev) => ({ ...prev, [skuId]: value }))}
          />
        ))}
      </ul>
    </div>
  );
}
