'use client'

import { useEffect } from "react"
import { PostHogProvider as PHProvider } from 'posthog-js/react'

import posthog from 'posthog-js'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    // useEffect(() => {
    //     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    //         api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    //         person_profiles: 'identified_only',
    //         defaults: '2025-05-24'
    //     })
    // }, [])

    return (
        <>
            {children}
        </>
    )
}
