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
    title: "GebetaMaps",
    description: "GebetaMaps",
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
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
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
