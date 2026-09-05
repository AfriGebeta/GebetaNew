//@ts-nocheck
"use client"

import * as React from "react"
import { useContext } from "react"
import { BookOpen, CreditCard, LockKeyhole, ReceiptIcon, Settings2, SquareTerminal, Building, ShieldCheck, ShieldBan, History, MapPin } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar, } from "@/components/ui/sidebar"
import Image from "next/image";
import { HomeIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { AuthContext } from "@/providers/AuthProvider";
import FreemiumCreditCard from "@/app/_component/FreemiumCreditCard";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const { currentUser } = useContext(AuthContext);
    const { open } = useSidebar()
    const data = {
        navMain: [
            {
                title: "Home",
                url: "/dashboard",
                icon: HomeIcon
            },
            {
                title: "Usage",
                url: "/dashboard/usage",
                icon: SquareTerminal,
            },
            {
                title: "Recent Calls",
                url: "/dashboard/recent-calls",
                icon: History,
            },
            {
                title: "API keys",
                url: "/dashboard/api-token",
                icon: LockKeyhole,
            },
            {
                title: "Service Accounts",
                url: "/dashboard/service-account",
                icon: ShieldCheck,
            },
            {
                title: "Access Blocks",
                url: "/dashboard/access-blocks",
                icon: ShieldBan,
            },
            {
                title: "My Subscription",
                url: "/dashboard/plan",
                icon: ReceiptIcon
            },
            currentUser?.user?.allow_image_upload === true ? { title: "Add Place", url: "/dashboard/add-place", icon: Building } : null,

            {
                title: "Billing",
                url: "/dashboard/billing",
                icon: CreditCard,
            },
            {
                title: "Documentation",
                url: "https://docs.gebeta.app",
                icon: BookOpen,
            },
            {
                title: "Account",
                url: "/dashboard/account",
                icon: Settings2
            },
            {
                title: "Map Embed",
                url: "/dashboard/map-embed",
                icon: MapPin,
            },
        ],
    }



    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href="/" className="flex gap-[4px] items-center">
                    <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="ml-[2px]" />
                    <h1 className={`${open ? "block" : "hidden"} uppercase`}>GebetaMaps</h1>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                {open && <FreemiumCreditCard />}
                <NavUser user={currentUser?.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
