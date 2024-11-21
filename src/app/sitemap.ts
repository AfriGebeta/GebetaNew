//@ts-nocheck
import {MetadataRoute} from 'next'
import {menuItems} from "@/constants";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gebeta.app'

    const routes = menuItems.map(item => ({
        url: item.link ? `${baseUrl}${item.link}` : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1
    }))

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/company`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: "https://gebeta-docs.vercel.app",
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.6,
        }
    ]

    return [...staticRoutes, ...routes]
}