import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Status & Uptime",
    description: "Live availability and incident history for the GebetaMaps geocoding, directions, matrix and map tile APIs.",
    alternates: { canonical: "/uptime" },
};

export default function UptimeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
