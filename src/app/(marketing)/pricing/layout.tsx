import type {Metadata} from "next";
import "react-multi-carousel/lib/styles.css";

export const metadata: Metadata = {
    title: "Pricing",
    description: "Transparent pay-as-you-go pricing for GebetaMaps location APIs. Rates fall as your usage grows, with no hidden fees and a custom enterprise plan for high-volume needs.",
    alternates: { canonical: "/pricing" },
    openGraph: {
        title: "GebetaMaps Pricing",
        description: "Transparent pay-as-you-go pricing for GebetaMaps location APIs. Rates fall as your usage grows, with no hidden fees.",
        url: "/pricing",
        type: "website",
    },
}

export default function PricingLayout({
                                          children,
                                      }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}
