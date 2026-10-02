//@ts-nocheck
import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import NextTopLoader from 'nextjs-toploader';
import { PostHogProvider } from "@/app/posthug-provider";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';


const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
});

const SITE_URL = "https://gebeta.app";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "GebetaMaps - Location Solutions Simplified",
        // Page-level titles render as "<page> | GebetaMaps".
        template: "%s | GebetaMaps",
    },
    description: "GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization. With up-to-date data and easy-to-use features, build precise, scalable solutions quickly.",
    keywords: ["maps", "geocoding", "route optimization", "directions", "matrix api", "ethiopia maps", "africa maps api"],
    authors: [{ name: "GebetaMaps" }],
    creator: 'GebetaMaps',
    publisher: 'GebetaMaps, Inc.',
    applicationName: 'GebetaMaps',
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
        url: SITE_URL,
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
    twitter: {
        card: 'summary_large_image',
        site: '@gebetamaps',
        creator: '@gebetamaps',
        title: 'GebetaMaps - Location Solutions Simplified',
        description: 'GebetaMaps delivers powerful APIs for all your location-based needs, from geocoding to route optimization.',
        images: ['/assets/opengraph-image.png'],
    },
};

// Emitted as a @graph so each entity (company, site, product) is its own node
// and can be matched to the right rich result.
const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'GebetaMaps',
            legalName: 'GebetaMaps, Inc.',
            url: SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/assets/logo.svg`,
            },
            image: `${SITE_URL}/assets/opengraph-image.png`,
            foundingDate: '2023',
            slogan: 'Let us find your way',
            description: 'Advanced location technology for businesses, developers, and logistics providers in Africa. Offering geocoding, routing, and location intelligence through powerful APIs.',
            founder: {
                '@type': 'Person',
                name: 'Bemhreth Gezahgh',
                jobTitle: 'Chief Executive Officer',
                sameAs: ['https://linkedin.com/in/bemhreth-gezahgh'],
            },
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Kazantchis, Bloom Tech',
                addressLocality: 'Addis Ababa',
                postalCode: '1000',
                addressCountry: 'ET',
            },
            contactPoint: [{
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: 'info@gebeta.app',
                url: `${SITE_URL}/contact`,
                availableLanguage: ['en', 'am'],
            }],
            sameAs: [
                'https://twitter.com/gebetamaps',
                'https://instagram.com/gebetamaps',
                'https://linkedin.com/company/gebetamaps',
            ],
            areaServed: {
                '@type': 'Continent',
                name: 'Africa',
            },
            knowsAbout: [
                'Geocoding',
                'Route Optimization',
                'Location Intelligence',
                'Navigation Systems',
                'African Maps',
                'API Development',
            ],
            award: ['Best Mobility & Logistics'],
        },
        {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'GebetaMaps',
            description: 'Location APIs for Africa - geocoding, directions, matrix and map tiles.',
            publisher: { '@id': `${SITE_URL}/#organization` },
            inLanguage: 'en',
        },
        {
            '@type': 'SoftwareApplication',
            '@id': `${SITE_URL}/#software`,
            name: 'GebetaMaps API',
            url: SITE_URL,
            applicationCategory: 'DeveloperApplication',
            applicationSubCategory: 'MapApplication',
            operatingSystem: 'All',
            publisher: { '@id': `${SITE_URL}/#organization` },
            description: 'Geocoding, directions, distance matrix, route optimization and vector map tiles delivered as REST APIs.',
            featureList: [
                'Geocoding and reverse geocoding',
                'Turn-by-turn directions',
                'Distance matrix',
                'Route optimization',
                'Vector map tiles',
            ],
            offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: '0',
                highPrice: '1000',
                offerCount: '4',
                url: `${SITE_URL}/pricing`,
                offers: [{
                    '@type': 'Offer',
                    name: 'Pay As You Go',
                    description: 'Pay only for what you use',
                    url: `${SITE_URL}/pricing`,
                }, {
                    '@type': 'Offer',
                    name: 'Custom Enterprise Plan',
                    description: 'Unlimited API calls for high-volume needs',
                    url: `${SITE_URL}/pricing`,
                }],
            },
            softwareHelp: {
                '@type': 'CreativeWork',
                url: 'https://docs.gebeta.app',
                name: 'API Documentation',
            },
        },
    ],
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
                    dangerouslySetInnerHTML={{
                        // Mirrors isTokenExpired() in src/lib/session.ts so an expired session never shows as signed in.
                        __html: `try{if(JSON.parse(localStorage.getItem('isAuthenticated'))){var t=(JSON.parse(localStorage.getItem('currentUser'))||{}).token,e=null;if(t){try{var p=JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(typeof p.exp==='number')e=p.exp*1000}catch(x){}}if(e===null||Date.now()<e-5000)document.documentElement.dataset.auth='1'}}catch(x){}`,
                    }}
                />
            </head>
            <body
                className={`${plusJakarta.className} ${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <NextTopLoader
                    color="#FFA500"
                    showSpinner={false}
                />
                <div className={
                    'overflow-x-hidden min-w-full w-full antialiased dark:bg-[#05050a] flex flex-col min-h-screen'
                }>
                    <ThemeProvider defaultTheme="light" storageKey="app-theme">
                        <AuthProvider>
                            <QueryProvider>
                                <PostHogProvider>
                                    {children}
                                </PostHogProvider>
                            </QueryProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </div>
            </body>
        </html >
    );
}
