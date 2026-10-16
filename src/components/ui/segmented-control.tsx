"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING } from "@/lib/motion";

type Option = { value: string; label: React.ReactNode };

type SegmentedControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly Option[];
  "aria-label": string;
  className?: string;
};

/** Single-choice pill switch with a sliding thumb. */
export default function SegmentedControl({
  value,
  onValueChange,
  options,
  className,
  ...props
}: SegmentedControlProps) {
  const id = React.useId();
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(next) => next && onValueChange(next)}
      data-slot="segmented-control"
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5", className)}
      {...props}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className="relative cursor-pointer rounded-full px-3 py-1.5 text-[13px] leading-none text-soft outline-none transition-colors duration-150 ease-power3-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=on]:text-foreground"
        >
          {option.value === value && (
            <motion.span
              layoutId={`${id}-thumb`}
              transition={SPRING.snappy}
              className="absolute inset-0 rounded-full bg-card shadow-btn"
            />
          )}
          <span className="relative">{option.label}</span>
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

export { SegmentedControl };
