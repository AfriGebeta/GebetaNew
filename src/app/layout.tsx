//@ts-nocheck
import type {Metadata} from "next";
import "./globals.css";
import {Plus_Jakarta_Sans} from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import {AuthProvider} from "@/providers/AuthProvider";
import {ThemeProvider} from "@/providers/theme-provider";


const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "GebetaMaps - Location Solutions Simplified",
    description: "GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization. With up-to-date data and easy-to-use features, build precise, scalable solutions quickly.",
    keywords: ["maps", "geocoding", "route optimization", "directions", "matrix api"],
    authors: [{name: "GebetaMaps"}],
    creator: "GebetaMaps",
    publisher: "GebetaMaps, Inc.",
    openGraph: {
        images:'/assets/gebeta-opengraph.png',
        type: 'website',
        locale: 'en_US',
        url: 'https://gebeta.app',
        title: 'GebetaMaps - Location Solutions Simplified',
        description: 'Powerful location-based APIs for geocoding and route optimization',
        siteName: 'GebetaMaps'
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${plusJakarta.className}`}
        >
        <div className={
            'overflow-x-hidden min-w-full w-full antialiased dark:bg-[#05050a] pt-8 flex flex-col min-h-screen'
        }>
            <ThemeProvider defaultTheme="system" storageKey="app-theme">
                <AuthProvider>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </AuthProvider>
            </ThemeProvider>
        </div>
        </body>
        </html>
    );
}
