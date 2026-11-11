import Navbar from "@/app/(marketing)/Navbar";
import Footer from "@/app/(marketing)/Footer";
import React from "react";
import LenisScrollProvider from "@/providers/lenis-provider";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LenisScrollProvider>
            <div
                className="relative flex min-h-screen w-full flex-col bg-background antialiased"
            >
                <Navbar/>
                <div className="flex-1">
                    {children}
                </div>
                <Footer/>
            </div>
        </LenisScrollProvider>
    );
}
