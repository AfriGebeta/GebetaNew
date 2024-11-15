//@ts-nocheck
"use client"

import {BadgeCheck, ChevronsUpDown, CreditCard, LogOut, Moon, Sun, Laptop} from "lucide-react"

import {Avatar, AvatarFallback,} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,} from "@/components/ui/sidebar"
import Link from "next/link"
import {useTheme} from "@/providers/theme-provider"
import {useContext} from "react";
import {AuthContext} from "@/providers/AuthProvider";

export function NavUser({
                            user,
                        }: {
    user: {
        username: string
        email?: string
        phone: string
    }
}) {
    const {isMobile} = useSidebar()
    const {theme, setTheme} = useTheme()
    const {logout} = useContext(AuthContext);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback
                                    className="rounded-lg">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.username}</span>
                                <span className="truncate text-xs">{user.phone}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback
                                        className="rounded-lg">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.username}</span>
                                    <span className="truncate text-xs">{user.phone}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <Link href="/dashboard/account">
                                <DropdownMenuItem>
                                    <BadgeCheck className="mr-2 h-4 w-4"/>
                                    Account
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/billing">
                                <DropdownMenuItem>
                                    <CreditCard className="mr-2 h-4 w-4"/>
                                    Billing
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
                                    {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                                    {theme === 'system' && <Laptop className="mr-2 h-4 w-4" />}
                                    Theme
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        Light
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        <Moon className="mr-2 h-4 w-4" />
                                        Dark
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        <Laptop className="mr-2 h-4 w-4" />
                                        System
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}