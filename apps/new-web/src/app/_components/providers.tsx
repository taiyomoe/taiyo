"use client"

import { useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"
import { Toaster } from "sonner"
import type { LayoutProps } from "~/utils/types"

export const Providers = ({ children }: LayoutProps) => {
  const router = useRouter()

  return (
    <RouterProvider navigate={router.push}>
      <Toaster />
      {children}
    </RouterProvider>
  )
}
