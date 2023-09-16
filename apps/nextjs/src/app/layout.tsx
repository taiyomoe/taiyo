import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ServerThemeProvider } from "@wits/next-themes";

import "~/styles/globals.css";

import { cn } from "~/utils/cn";
import { TRPCReactProvider } from "./providers";

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

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <ServerThemeProvider attribute="class">
      <html lang="en">
        <body
          className={cn(
            ["font-sans", fontSans.variable].join(" "),
            "h-screen scrollbar-thin scrollbar-track-background scrollbar-thumb-card",
          )}
        >
          <TRPCReactProvider headers={headers()}>
            {props.children}
          </TRPCReactProvider>
        </body>
      </html>
    </ServerThemeProvider>
  );
}
