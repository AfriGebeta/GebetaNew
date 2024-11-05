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
        <html lang="en">
        <body
            className={`${plusJakarta.className} w-full antialiased pt-20 flex flex-col min-h-screen`}
        >
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
        </body>
        </html>
    );
}
