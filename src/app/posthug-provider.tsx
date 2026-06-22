'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY

    if (!key) {
        console.warn('[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY — tracking disabled')
    } else {
        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            person_profiles: 'always',
            defaults: '2025-05-24',
            capture_exceptions: true,
            debug: process.env.NODE_ENV === 'development',
        })

        if (process.env.NODE_ENV === 'production') {
            console.log('[PostHog] loaded:', posthog.__loaded)
            console.log('[PostHog] distinct_id:', posthog.get_distinct_id())
            console.log('[PostHog] identified:', !posthog.get_distinct_id()?.startsWith('$anon'))
        }
    }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PHProvider client={posthog}>
            {children}
        </PHProvider>
    )
}