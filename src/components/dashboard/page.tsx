import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = {
  children: ReactNode;
  className?: string;
};

export function Page({ children, className }: PageProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[1100px] flex-col gap-8 p-4 md:p-6", className)}>
      {children}
    </div>
  );
}

type PageIntroProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageIntro({ title, description, actions, className }: PageIntroProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex max-w-[44em] flex-col gap-2">
        <h2 className="h2-style text-foreground">{title}</h2>
        {description && <p className="p-style leading-[1.4] text-soft">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

type SectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({ title, description, action, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {(title || action) && (
        <div className="flex min-h-[30px] items-center justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            {title && <h3 className="eyebrow-style text-subtle">{title}</h3>}
            {description && <p className="caption-style leading-[1.4] text-soft">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-strong px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-faint [&_svg]:size-8">{icon}</div>}
      <p className="lead-style font-medium text-foreground">{title}</p>
      {description && <p className="caption-style max-w-[32em] leading-[1.4] text-subtle">{description}</p>}
      {action}
    </div>
  );
}
