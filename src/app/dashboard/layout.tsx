"use client"

import {usePathname} from 'next/navigation';
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Toaster} from "react-hot-toast";
import PrivateRoute from "@/components/PrivateRoute";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Create breadcrumb items from the pathname
    const breadcrumbItems = pathname
        .split('/')
        .filter(segment => segment) // Remove empty segments
        .map((segment, index) => {
            const formattedSegment = segment.replace(/-/g, ' '); // Replace underscores with spaces
            const href = '/dashboard' + pathname.split('/').slice(1, index + 1).join('/'); // Create href for each segment

            return {
                title: formattedSegment.charAt(0).toUpperCase() + formattedSegment.slice(1),
                href
            };
        });

    return (
        <PrivateRoute>
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset className="dark:bg-[#05050a]">
                    <header
                        className="flex h-fit shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-fit">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1"/>
                            <Separator orientation="vertical" className="mr-2 h-4"/>
                            <Breadcrumb>
                                <BreadcrumbList className="flex items-center">
                                    {breadcrumbItems.map((item, index) => (
                                        <div key={item.href} className="flex items-center">
                                            <BreadcrumbItem
                                                className="hidden md:block px-1"> {/* Add padding for spacing */}
                                                <BreadcrumbLink href={item.href}>
                                                    {item.title}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {index < breadcrumbItems.length - 1 && (
                                                <BreadcrumbSeparator className="mx-1"/> // Add horizontal margin for consistency
                                            )}
                                        </div>
                                    ))}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex flex-1 overflow-hidden relative flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                    <Toaster/>
                </SidebarInset>
            </SidebarProvider>
        </PrivateRoute>
    );
}