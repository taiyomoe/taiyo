"use client"

import { useRouter } from "next/navigation"
import { RouterProvider } from "react-aria-components"
import type { LayoutProps } from "~/utils/types"

export const Providers = ({ children }: LayoutProps) => {
  const router = useRouter()

  return <RouterProvider navigate={router.push}>{children}</RouterProvider>
}
