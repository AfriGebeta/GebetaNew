import * as React from "react";
import { cn } from "@/lib/utils";

const RANGE_CLASSES =
  "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-card [&::-moz-range-thumb]:shadow-btn [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-btn [&::-webkit-slider-thumb]:transition-[box-shadow] [&::-webkit-slider-thumb]:duration-150 focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_4px_hsl(var(--primary)/0.35)] focus-visible:[&::-moz-range-thumb]:shadow-[0_0_0_4px_hsl(var(--primary)/0.35)]";

type RangeProps = Omit<React.ComponentProps<"input">, "type" | "value" | "min" | "max"> & {
  value: number;
  min: number;
  max: number;
};

/** Native range input with a primary fill up to the current value. */
const Range = React.forwardRef<HTMLInputElement, RangeProps>(
  ({ className, style, value, min, max, ...props }, ref) => {
    const fill = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
    return (
      <input
        ref={ref}
        type="range"
        data-slot="range"
        value={value}
        min={min}
        max={max}
        className={cn(RANGE_CLASSES, className)}
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${fill}%, hsl(var(--ds-track)) ${fill}%)`,
          ...style,
        }}
        {...props}
      />
    );
  },
);
Range.displayName = "Range";

export { Range };
