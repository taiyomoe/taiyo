"use client"

import { NextUIProvider } from "@nextui-org/react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { useRouter } from "next/navigation"
import { Toaster } from "sonner"
import type { LayoutProps } from "~/lib/types"
import { TRPCReactProvider } from "~/trpc/react"

export const Providers = (props: LayoutProps) => {
  const router = useRouter()

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <TRPCReactProvider>
        <NextUIProvider navigate={router.push}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Toaster
              richColors
              closeButton
              position="top-right"
              toastOptions={{
                className: "top-[var(--navbar-height)_!important] left-2",
              }}
            />
            {props.children}
          </ThemeProvider>
        </NextUIProvider>
      </TRPCReactProvider>
    </SessionProvider>
  )
}
