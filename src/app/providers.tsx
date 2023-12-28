"use client"

import { NextUIProvider } from "@nextui-org/react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

import { TRPCReactProvider } from "~/lib/trpc/Provider"

type ProviderProps = {
  children: React.ReactNode
  headers: Headers
}

export const Providers = (props: ProviderProps) => {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <TRPCReactProvider headers={props.headers}>
        <NextUIProvider>
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
