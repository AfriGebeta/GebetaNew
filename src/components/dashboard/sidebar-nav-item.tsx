import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CountBadge from "@/components/ui/count-badge";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  count?: number;
  active?: boolean;
  external?: boolean;
  tone?: "default" | "quiet";
  onNavigate?: () => void;
};

export default function SidebarNavItem({
  icon: Icon,
  label,
  href,
  count,
  active = false,
  external = false,
  tone = "default",
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <li className={cn(active && "my-px")}>
      <Button
        variant="nav"
        size="md"
        href={href}
        data-active={active}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={cn(
          "group h-[30px] gap-1.5 py-0 data-[active=true]:h-8",
          tone === "quiet" && "text-subtle",
        )}
      >
        <Icon
          aria-hidden
          className="text-subtle transition-colors duration-150 ease-power3-out group-hover:text-icon group-data-[active=true]:text-icon"
        />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
        {external && <ArrowUpRight aria-hidden className="text-subtle" />}
      </Button>
    </li>
  );
}
