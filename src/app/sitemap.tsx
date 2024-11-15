//@ts-nocheck
import { MetadataRoute } from 'next'
import {menuItems} from "@/constants";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://gebeta.app'

    const routes = menuItems.map(item => ({
        url: item.link ? `${baseUrl}${item.link}` : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: item.link === '' ? 1 : 0.8,
    }))

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/company`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }
    ]

    return [...staticRoutes, ...routes]
}