import Navbar from "@/app/(marketing)/Navbar";
import Footer from "@/app/(marketing)/Footer";
import React from "react";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div
                className="relative w-full antialiased pt-[50px] flex flex-col min-h-screen dark:bg-[#05050a]"
            >
                <Navbar/>
                <div className="flex-1">
                    {children}
                </div>
                <Footer/>
            </div>
        </>
    );
}
