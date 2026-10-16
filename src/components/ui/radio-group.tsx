"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    className={cn("grid gap-2", className)}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    className={cn(
      "peer inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-secondary outline-none transition-[border-color] duration-150 ease-power3-out hover:border-ring focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="block size-2 rounded-full bg-primary" />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

type RadioCardProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  title: React.ReactNode;
  description?: React.ReactNode;
};

/** A full-width selectable card; use inside RadioGroup when options need a description. */
const RadioCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardProps
>(({ className, title, description, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-card"
    className={cn(
      "group flex w-full cursor-pointer items-start gap-3 rounded-lg bg-secondary p-3 text-left shadow-btn-subtle outline-none transition-[box-shadow,background-color] duration-150 ease-power3-out hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:shadow-[0_0_0_1.5px_hsl(var(--primary))]",
      className,
    )}
    {...props}
  >
    <span className="mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-secondary transition-[border-color] duration-150 group-data-[state=checked]:border-primary">
      <RadioGroupPrimitive.Indicator className="block size-2 rounded-full bg-primary" />
    </span>
    <span className="flex flex-col gap-1">
      <span className="text-[14px] font-medium leading-none text-foreground">{title}</span>
      {description && (
        <span className="caption-style leading-[1.4] text-subtle">{description}</span>
      )}
    </span>
  </RadioGroupPrimitive.Item>
));
RadioCard.displayName = "RadioCard";

export { RadioGroup, RadioGroupItem, RadioCard };
