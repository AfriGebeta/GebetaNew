"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./user-menu";
import { getPageTitle } from "./nav";

type HeaderProps = {
  onOpenNavigation: () => void;
};

export default function Header({ onOpenNavigation }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="shrink-0 border-b border-border">
      <div className="flex items-center justify-between gap-2 px-4 py-[14px]">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={onOpenNavigation}
          >
            <Menu aria-hidden />
          </Button>
          <h1 className="h1-style truncate">{getPageTitle(pathname)}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
