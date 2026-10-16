//@ts-nocheck
"use client"

import {useState} from "react";
import {Toaster} from "@/components/ui/toaster"
import PrivateRoute from "@/components/PrivateRoute";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <PrivateRoute>
            <main className="dash-root flex h-dvh max-w-full overflow-hidden bg-background font-sans text-foreground antialiased">
                <Sidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen}/>
                <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <Header onOpenNavigation={() => setMobileNavOpen(true)}/>
                    <div className="relative min-h-0 flex-1 overflow-y-auto">
                        {children}
                    </div>
                </section>
                <Toaster/>
            </main>
        </PrivateRoute>
    );
}
