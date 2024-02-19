import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { siteConfig } from "~/lib/config"
import { getBaseUrl } from "~/lib/trpc/shared"
import { LayoutProps } from "~/lib/types"
import { cn } from "~/lib/utils/cn"
import { Providers } from "./providers"

import "~/styles/globals.css"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

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
          ["font-sans", fontSans.variable].join(" "),
          "h-full min-h-dvh bg-background scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary",
        )}
      >
        <Providers headers={headers()}>{children}</Providers>
      </body>
    </html>
  )
}
