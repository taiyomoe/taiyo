import createNextIntlPlugin from "next-intl/plugin"
import "./src/env"
import type { NextConfig } from "next"

const withNextIntl = createNextIntlPlugin()

const config = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.taiyo.moe",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-**.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "asset.brandfetch.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "https" as const,
              hostname: "avatars.githubusercontent.com",
              pathname: "/u/**",
            },
            {
              protocol: "https" as const,
              hostname: "loremflickr.com",
              pathname: "/**",
            },
            {
              protocol: "https" as const,
              hostname: "picsum.photos",
              pathname: "/seed/**",
            },
          ]
        : []),
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@taiyomoe/auth",
    "@taiyomoe/cache",
    "@taiyomoe/constants",
    "@taiyomoe/db",
    "@taiyomoe/logs",
    "@taiyomoe/meilisearch",
    "@taiyomoe/messages",
    "@taiyomoe/schemas",
    "@taiyomoe/services",
    "@taiyomoe/trpc",
    "@taiyomoe/umami",
    "@taiyomoe/utils",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig

export default withNextIntl(config)
