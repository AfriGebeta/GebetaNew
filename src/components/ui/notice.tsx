import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const noticeVariants = cva("rounded-lg border px-3 py-2 text-[13px] leading-[1.4]", {
  variants: {
    tone: {
      danger: "border-[var(--ds-tag-red-border)] bg-[var(--ds-tag-red-bg)] text-[var(--ds-tag-red-text)]",
      success: "border-[var(--ds-tag-green-border)] bg-[var(--ds-tag-green-bg)] text-[var(--ds-tag-green-text)]",
      warning: "border-[var(--ds-tag-amber-border)] bg-[var(--ds-tag-amber-bg)] text-[var(--ds-tag-amber-text)]",
      info: "border-[var(--ds-tag-blue-border)] bg-[var(--ds-tag-blue-bg)] text-[var(--ds-tag-blue-text)]",
    },
  },
  defaultVariants: { tone: "danger" },
});

type NoticeProps = ComponentProps<"p"> & VariantProps<typeof noticeVariants>;

export default function Notice({ tone, className, ...props }: NoticeProps) {
  return (
    <p
      role={tone === "danger" || tone == null ? "alert" : "status"}
      data-slot="notice"
      className={cn(noticeVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Notice, noticeVariants };
