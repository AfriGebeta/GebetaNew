import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building,
  CreditCard,
  History,
  House,
  KeyRound,
  MapPin,
  ReceiptText,
  Settings2,
  ShieldBan,
  ShieldCheck,
  SquareTerminal,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  requiresImageUpload?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Home", href: "/dashboard", icon: House },
      { label: "Usage", href: "/dashboard/usage", icon: SquareTerminal },
      { label: "Recent Calls", href: "/dashboard/recent-calls", icon: History },
    ],
  },
  {
    title: "Access",
    items: [
      { label: "API Keys", href: "/dashboard/api-token", icon: KeyRound },
      { label: "Service Accounts", href: "/dashboard/service-account", icon: ShieldCheck },
      { label: "Access Blocks", href: "/dashboard/access-blocks", icon: ShieldBan },
    ],
  },
  {
    title: "Build",
    items: [
      { label: "Map Embed", href: "/dashboard/map-embed", icon: MapPin },
      {
        label: "Add Place",
        href: "/dashboard/add-place",
        icon: Building,
        requiresImageUpload: true,
      },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "My Subscription", href: "/dashboard/plan", icon: ReceiptText },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
];

export const NAV_FOOTER: NavItem[] = [
  { label: "Documentation", href: "https://docs.gebeta.app", icon: BookOpen, external: true },
];

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string) {
  const items = [...NAV_SECTIONS.flatMap((section) => section.items), ...NAV_FOOTER];
  const match = items
    .filter((item) => !item.external && isNavItemActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Dashboard";
}
