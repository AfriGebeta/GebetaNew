//@ts-nocheck
"use client";

import {ChevronRight, type LucideIcon} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {ArrowTopRightIcon} from "@radix-ui/react-icons";
import {useRouter} from 'nextjs-toploader/app';
import {usePathname} from "next/navigation";

export function NavMain({
                            items,
                        }: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const router = useRouter()
    const pathname = usePathname();

    const isActive = (item) => pathname === item.url;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>GebetaMaps</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem
                            className={`${isActive(item) ? "bg-[#FFA500] text-white" : ""} rounded-[8px]`}>
                            <CollapsibleTrigger asChild>
                                <a onClick={() => router.push(item.url)} style={{width: '100%', display: 'block'}}>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon className="mr-2"/>}
                                        {item.title}
                                        {item.items && (
                                            <ChevronRight
                                                className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                                            />
                                        )}
                                        {item.title === "Documentation" && (
                                            <ArrowTopRightIcon
                                                className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                                        )}
                                    </SidebarMenuButton>
                                </a>
                            </CollapsibleTrigger>
                            {item.items && (
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={subItem.url}>
                                                        <span className="flex items-center">
                                                            {subItem.icon && <subItem.icon className="mr-2"/>}
                                                            {subItem.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}