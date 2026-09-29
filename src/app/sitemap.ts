import type {MetadataRoute} from 'next'
import {getAllPosts} from '@/lib/mdx'

const SITE_URL = 'https://gebeta.app'

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = ([
        {url: SITE_URL, changeFrequency: 'daily', priority: 1.0},
        {url: `${SITE_URL}/pricing`, changeFrequency: 'weekly', priority: 0.9},
        {url: `${SITE_URL}/company`, changeFrequency: 'monthly', priority: 0.8},
        {url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7},
        {url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6},
        {url: `${SITE_URL}/uptime`, changeFrequency: 'daily', priority: 0.4},
        {url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3},
        {url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3},
    ] as const).map((route) => ({...route, lastModified: new Date()}))

    // Each post gets its own entry, dated from its front matter rather than "now",
    // so recrawls track real edits instead of every deploy.
    const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post: { slug: string; date?: string }) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes]
}
