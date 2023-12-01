import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";

import "~/styles/globals.css";

import { siteConfig } from "~/lib/config";
import type { LayoutProps } from "~/lib/types";
import { cn } from "~/lib/utils/cn";

import { Providers } from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
  authors: [
    {
      name: "rdx",
      url: "https://rdx.dev",
    },
  ],
  creator: "rdx",
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          ["font-sans", fontSans.variable].join(" "),
          "scrollbar-thumb-card h-full min-h-screen bg-background scrollbar-thin scrollbar-track-background",
        )}
      >
        <Providers headers={headers()}>{children}</Providers>
      </body>
    </html>
  );
}
