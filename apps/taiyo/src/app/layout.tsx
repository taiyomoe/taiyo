import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { siteConfig } from "~/lib/config"
import type { LayoutProps } from "~/lib/types"
import { cn } from "~/lib/utils/cn"
import { getBaseUrl } from "~/trpc/shared"
import { Providers } from "./providers"

import "~/styles/globals.css"
import { env } from "~/env"

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

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
