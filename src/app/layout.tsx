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
    metadataBase: new URL("https://gebeta.app"),
    title: "GebetaMaps - Location Solutions Simplified",
    description: "GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization. With up-to-date data and easy-to-use features, build precise, scalable solutions quickly.",
    keywords: ["maps", "geocoding", "route optimization", "directions", "matrix api"],
    authors: [{name: "GebetaMaps"}],
    creator: 'GebetaMaps',
    publisher: 'GebetaMaps, Inc.',
    applicationName: 'GebetaMaps',
    alternates: {
        canonical: 'https://gebeta.app',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'GebetaMaps - Location Solutions Simplified',
        description: 'GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization.',
        url: 'https://gebeta.app',
        siteName: 'GebetaMaps',
        images: [
            {
                url: '/assets/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'GebetaMaps OpenGraph Image',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

// app/layout.tsx
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'SoftwareApplication', 'TechnologyCompany'],
    name: 'GebetaMaps',
    legalName: 'GebetaMaps, Inc.',
    url: 'https://gebeta.app',
    logo: 'https://gebeta.app/logo.png',
    foundingDate: '2023',
    founders: [{
        '@type': 'Person',
        name: 'Bemhreth Gezahgh',
        jobTitle: 'Chief Executive Officer',
        sameAs: [
            'https://linkedin.com/in/bemhreth-gezahgh',  // Replace with actual URL
        ]
    }],
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kazantchis Bloom tech',
        addressLocality: 'Addis Ababa',
        postalCode: '1000',
        addressCountry: 'Ethiopia'
    },
    contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'info@gebeta.app',
        availableLanguage: ['en', 'am']
    }],
    sameAs: [
        'https://twitter.com/gebetamaps',
        'https://instagram.com/gebetamaps',
        'https://linkedin.com/company/gebetamaps'
    ],
    applicationCategory: 'MapApplication',
    applicationSubCategory: 'NavigationApplication',
    operatingSystem: 'All',
    offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: '1000',
        offerCount: '4',
        offers: [{
            '@type': 'Offer',
            name: 'Pay As You Go',
            description: 'Pay only for what you use'
        }, {
            '@type': 'Offer',
            name: 'Custom Enterprise Plan',
            description: 'Unlimited API calls for high-volume needs'
        }]
    },
    hasMap: 'https://gebeta.app',
    areaServed: {
        '@type': 'Continent',
        name: 'Africa'
    },
    knowsAbout: [
        'Geocoding',
        'Route Optimization',
        'Location Intelligence',
        'Navigation Systems',
        'African Maps',
        'API Development'
    ],
    keywords: 'maps, geocoding, route optimization, directions, matrix api, african maps, ethiopia maps',
    slogan: 'Let us find your way',
    description: 'Advanced location technology for businesses, developers, and logistics providers in Africa. Offering geocoding, routing, and location intelligence through powerful APIs.',
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://gebeta.app'
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
        bestRating: '5',
        worstRating: '1'
    },
    award: [
        'Best Mobility & Logistics',
    ],
    availableChannel: [{
        '@type': 'ServiceChannel',
        serviceUrl: 'https://docs.gebeta.app',
        serviceType: 'API Documentation'
    }],
    featuredCustomers: [{
        '@type': 'Organization',
        name: 'ZayRide',
        review: {
            '@type': 'Review',
            reviewBody: 'Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers',
            author: {
                '@type': 'Person',
                name: 'Habtamu Tadesse',
                jobTitle: 'Founder and CEO'
            }
        }
    }, {
        '@type': 'Organization',
        name: 'NID',
        review: {
            '@type': 'Review',
            reviewBody: 'Helping citizens locate our Registration centers with ease',
            author: {
                '@type': 'Person',
                name: 'Abenezer Feleke',
                jobTitle: 'Head of Communications'
            }
        }
    }]
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script
                async
                crossOrigin="anonymous"
                src="https://tweakcn.com/live-preview.min.js"
            />
        </head>
        <body
            className={`${plusJakarta.className}`}
        >
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
