"use client"

import { useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"
import { Toaster } from "~/components/ui/toaster"
import type { LayoutProps } from "~/utils/types"
import { PostHogProvider } from "./posthog-provider"

export const Providers = ({ children }: LayoutProps) => {
  const router = useRouter()

  return (
    <RouterProvider navigate={router.push}>
      <PostHogProvider>
        <Toaster />
        {children}
      </PostHogProvider>
    </RouterProvider>
  )
}
