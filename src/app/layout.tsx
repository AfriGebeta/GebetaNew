//@ts-nocheck
import type {Metadata} from "next";
import "./globals.css";
import {Plus_Jakarta_Sans} from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import {AuthProvider} from "@/providers/AuthProvider";
import {ThemeProvider} from "@/providers/theme-provider";
import NextTopLoader from 'nextjs-toploader';
import {PostHogProvider} from "@/app/posthug-provider";


const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://gebeta.app/" || 'http://localhost:3000'),
    title: "GebetaMaps - Location Solutions Simplified",
    description: "GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization. With up-to-date data and easy-to-use features, build precise, scalable solutions quickly.",
    keywords: ["maps", "geocoding", "route optimization", "directions", "matrix api"],
    authors: [{name: "GebetaMaps"}],
    creator: "GebetaMaps",
    publisher: "GebetaMaps, Inc.",
    robots: {
        index: true,
        follow: true,
        nocache: true,
    },
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
        <NextTopLoader
            color="#FFA500"
            showSpinner={false}
        />
        <PostHogProvider>
            <div className={
                'overflow-x-hidden min-w-full w-full antialiased dark:bg-[#05050a] flex flex-col min-h-screen'
            }>
                <ThemeProvider defaultTheme="light" storageKey="app-theme">
                    <AuthProvider>
                        <QueryProvider>
                            {children}
                        </QueryProvider>
                    </AuthProvider>
                </ThemeProvider>
            </div>
        </PostHogProvider>
        </body>
        </html>
    );
}
