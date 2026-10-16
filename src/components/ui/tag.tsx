import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex h-[22px] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border text-[12px] leading-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        blue: "border-[var(--ds-tag-blue-border)] bg-[var(--ds-tag-blue-bg)] text-[var(--ds-tag-blue-text)]",
        purple:
          "border-[var(--ds-tag-purple-border)] bg-[var(--ds-tag-purple-bg)] text-[var(--ds-tag-purple-text)]",
        green:
          "border-[var(--ds-tag-green-border)] bg-[var(--ds-tag-green-bg)] text-[var(--ds-tag-green-text)]",
        red: "border-[var(--ds-tag-red-border)] bg-[var(--ds-tag-red-bg)] text-[var(--ds-tag-red-text)]",
        orange:
          "border-[var(--ds-tag-orange-border)] bg-[var(--ds-tag-orange-bg)] text-[var(--ds-tag-orange-text)]",
        amber:
          "border-[var(--ds-tag-amber-border)] bg-[var(--ds-tag-amber-bg)] text-[var(--ds-tag-amber-text)]",
        teal: "border-[var(--ds-tag-teal-border)] bg-[var(--ds-tag-teal-bg)] text-[var(--ds-tag-teal-text)]",
        yellow:
          "border-[var(--ds-tag-yellow-border)] bg-[var(--ds-tag-yellow-bg)] text-[var(--ds-tag-yellow-text)]",
        neutral:
          "border-[var(--ds-tag-neutral-border)] bg-[var(--ds-tag-neutral-bg)] text-[var(--ds-tag-neutral-text)]",
      },
      size: {
        md: "px-2",
        sm: "px-1.5",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

type TagProps = ComponentProps<"span"> & VariantProps<typeof tagVariants>;

export default function Tag({ tone, size, className, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone, size }), className)} {...props} />;
}

export { Tag, tagVariants };
