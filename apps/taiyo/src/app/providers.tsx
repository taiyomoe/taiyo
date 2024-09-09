"use client"

import { NextUIProvider } from "@nextui-org/react"
import { SessionProvider } from "@taiyomoe/auth/client"
import { Provider as JotaiProvider } from "jotai"
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
        <NextUIProvider locale="pt-BR" navigate={router.push}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <JotaiProvider>
              <Toaster
                richColors
                closeButton
                position="top-right"
                toastOptions={{
                  className: "top-[var(--navbar-height)_!important] left-2",
                }}
              />
              {props.children}
            </JotaiProvider>
          </ThemeProvider>
        </NextUIProvider>
      </TRPCReactProvider>
    </SessionProvider>
  )
}
