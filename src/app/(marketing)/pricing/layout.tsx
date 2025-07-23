import type {Metadata} from "next";
import "react-multi-carousel/lib/styles.css";

export const metadata:Metadata = {
    title:"GebetaMaps Pricing"
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
