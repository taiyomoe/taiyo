import { fileURLToPath } from "url"
import createJiti from "jiti"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env")

/** @type {import("next").NextConfig} */
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
              protocol: "https",
              hostname: "avatars.githubusercontent.com",
              pathname: "/u/**",
            },
            {
              protocol: "https",
              hostname: "loremflickr.com",
              pathname: "/**",
            },
            {
              protocol: "https",
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
}

export default withNextIntl(config)
