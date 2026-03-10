'use client'

import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'always', // Track anonymous users for session replay
    })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return <Provider client={posthog}>{children}</Provider>
}
