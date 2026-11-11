import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Tag from "@/components/ui/tag";

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, hint, badge, icon, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-card p-4 shadow-card transition-colors duration-150 ease-power3-out",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow-style truncate text-subtle">{label}</span>
        {badge && (
          <Tag size="sm" tone="neutral">
            {icon}
            {badge}
          </Tag>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="truncate text-[22px] font-medium leading-none tabular-nums tracking-[-0.01em] text-foreground">
          {value}
        </span>
        {hint && <span className="caption-style truncate text-soft">{hint}</span>}
      </div>
    </article>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg bg-card p-4 shadow-card", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-[22px] w-32" />
    </div>
  );
}
