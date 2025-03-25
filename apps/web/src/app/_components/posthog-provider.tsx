"use client"

import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect } from "react"
import { env } from "~/env"
import { useUser } from "~/stores/auth.store"
import type { ProviderProps } from "~/utils/types"

export const PostHogProvider = ({ children }: ProviderProps) => {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}

const PostHogPageView = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const user = useUser()

  useEffect(() => {
    if (!pathname || !posthog) return

    const search = searchParams.toString()
    const url = search ? `?${search}` : window.origin + pathname

    posthog.capture("$pageview", { $current_url: url })
  }, [pathname, searchParams, posthog])

  useEffect(() => {
    if (!user || !posthog || !posthog._isIdentified()) return

    posthog.identify(user.email)
  }, [user, posthog])

  return null
}
