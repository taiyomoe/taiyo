import { SessionProvider } from "@taiyomoe/auth/client"
import { auth } from "@taiyomoe/auth/server"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { Inter } from "next/font/google"
import Script from "next/script"
import { env } from "~/env"
import { siteConfig } from "~/lib/config"
import type { LayoutProps } from "~/lib/types"
import { cn } from "~/lib/utils/cn"
import { getBaseUrl } from "~/trpc/shared"
import { Providers } from "./providers"

import "~/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  twitter: siteConfig.twitter,
  openGraph: siteConfig.openGraph,
  metadataBase: new URL(getBaseUrl()),
  authors: [
    {
      name: "rdx",
      url: "https://rdx.dev",
    },
  ],
  creator: "rdx",
}

export default async function Layout({ children }: LayoutProps) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await auth()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary h-full min-h-dvh bg-background",
          inter.className,
        )}
      >
        <Script
          src={`${env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
          data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
        <NextIntlClientProvider messages={messages}>
          <SessionProvider session={session} refetchOnWindowFocus={false}>
            <Providers>{children}</Providers>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
