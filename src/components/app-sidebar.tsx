//@ts-nocheck
"use client"

import * as React from "react"
import {useContext} from "react"
import {BookOpen, CreditCard, LockKeyhole, ReceiptIcon, Settings2, SquareTerminal,} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar,} from "@/components/ui/sidebar"
import Image from "next/image";
import {HomeIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {AuthContext} from "@/providers/AuthProvider";
import FreemiumCreditCard from "@/app/_component/FreemiumCreditCard";

// This is sample data.
const data = {
    navMain: [
        {
          title: "Home",
          url: "/dashboard",
          icon:HomeIcon
        },
        {
            title: "Usage",
            url: "/dashboard/usage",
            icon: SquareTerminal,
        },
        {
            title: "API keys",
            url: "/dashboard/api-token",
            icon: LockKeyhole,
        },
        {
            title: "My Subscription",
            url: "/dashboard/plan",
            icon: ReceiptIcon
        },
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
            title:"Account",
            url:"/dashboard/account",
            icon:Settings2
        }
    ],
}


export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const { currentUser } = useContext(AuthContext);
    const {open} = useSidebar()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href="/" className="flex gap-[4px] items-center">
                    <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="ml-[2px]" />
                    <h1 className={`${open ? "block": "hidden"} uppercase`}>GebetaMaps</h1>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
            </SidebarContent>
            <SidebarFooter>
                <FreemiumCreditCard />
                <NavUser user={currentUser?.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
