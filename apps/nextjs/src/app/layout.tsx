import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";

import "~/styles/globals.css";

import type { LayoutProps } from "~/types";
import { cn } from "~/utils/cn";
import { Providers } from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Create T3 Turbo",
  description: "Simple monorepo with shared backend for web & mobile apps",
  metadataBase: new URL("https://taiyo.moe/"),
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          ["font-sans", fontSans.variable].join(" "),
          "scrollbar-thumb-card h-screen scrollbar-thin scrollbar-track-background",
        )}
      >
        <Providers headers={headers()}>{children}</Providers>
      </body>
    </html>
  );
}
