import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: "Talk to the GebetaMaps team about location APIs, enterprise plans, integration support or partnerships. Based in Addis Ababa, serving customers across Africa.",
    alternates: { canonical: "/contact" },
    openGraph: {
        title: "Contact GebetaMaps",
        description: "Talk to the GebetaMaps team about location APIs, enterprise plans, integration support or partnerships.",
        url: "/contact",
        type: "website",
    },
}

export default function ContactLayout({
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
