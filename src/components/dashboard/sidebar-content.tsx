"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/providers/AuthProvider";
import FreemiumCreditCard from "@/app/_component/FreemiumCreditCard";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import { NAV_FOOTER, NAV_SECTIONS, isNavItemActive } from "./nav";

type SidebarContentProps = {
  onNavigate?: () => void;
};

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { currentUser } = useContext(AuthContext);
  const canUploadImages = currentUser?.user?.allow_image_upload === true;

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.requiresImageUpload || canUploadImages),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar-accent p-3"
      >
        <Image src="/assets/logo.svg" width={32} height={32} alt="" className="size-8 shrink-0" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em] text-foreground">
            Gebeta Maps
          </span>
          <span className="caption-style block truncate text-subtle">Developer console</span>
        </div>
      </Link>

      <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto">
        {sections.map((section, index) => (
          <SidebarSection
            key={section.title ?? index}
            title={section.title}
            className={index < sections.length - 1 ? "border-b border-sidebar-border" : undefined}
          >
            {section.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isNavItemActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>

      <SidebarSection className="shrink-0 border-y border-sidebar-border">
        {NAV_FOOTER.map((item) => (
          <SidebarNavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            external={item.external}
            active={!item.external && isNavItemActive(pathname, item.href)}
            tone="quiet"
            onNavigate={onNavigate}
          />
        ))}
      </SidebarSection>

      <FreemiumCreditCard />
    </div>
  );
}
