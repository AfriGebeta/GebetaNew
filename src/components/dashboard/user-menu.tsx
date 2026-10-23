"use client";

import { useContext } from "react";
import { CreditCard, Laptop, LogOut, Moon, Settings2, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const router = useRouter();
  const { currentUser, logout } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
  const username: string = currentUser?.user?.username ?? "";
  const initials = username.slice(0, 2).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="none"
          className="caption-style h-[30px] gap-1.5 py-[5px] pl-[5px] pr-[9px] font-normal"
          aria-label={`Account menu for ${username}`}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
            {initials}
          </span>
          <span className="hidden max-w-[140px] truncate sm:inline">{username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1.5">
          <span className="truncate text-foreground">{username}</span>
          {currentUser?.user?.phone && <span className="truncate">{currentUser.user.phone}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/dashboard/account")}>
          <Settings2 />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/dashboard/billing")}>
          <CreditCard />
          Billing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="text-subtle" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="text-subtle" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Laptop className="text-subtle" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
