"use client"

import { useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"
import { Toaster } from "~/components/ui/toaster"
import { TRPCReactProvider } from "~/utils/trpc/react"
import type { LayoutProps } from "~/utils/types"
import { PostHogProvider } from "./posthog-provider"

export const Providers = ({ children }: LayoutProps) => {
  const router = useRouter()

  return (
    <TRPCReactProvider>
      <RouterProvider navigate={router.push}>
        <PostHogProvider>
          <Toaster />
          {children}
        </PostHogProvider>
      </RouterProvider>
    </TRPCReactProvider>
  )
}
