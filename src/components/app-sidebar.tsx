"use client"

import * as React from "react"
import {
    BadgeCheckIcon,
    BookOpen,
    Bot,
    CreditCard,
    GalleryVerticalEnd,
    KeyIcon,
    Settings2,
    SquareTerminal,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "@/components/ui/sidebar"
import Image from "next/image";
import useLocalStorage from "@/hooks/use-local-storage";
import {HomeIcon} from "@radix-ui/react-icons";
import Link from "next/link";
import {useContext} from "react";
import {AuthContext} from "@/providers/AuthProvider";

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
            icon: KeyIcon,
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

    console.log(currentUser)

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex gap-[4px] items-center">
                    <Link href="/">
                        <Image src="/assets/logo.svg" width={30} height={30} alt="logo" className="ml-2" />
                    </Link>
                    {/*<h1>GebetaMaps</h1>*/}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={currentUser?.user}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
