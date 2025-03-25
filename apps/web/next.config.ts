import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import "./src/env"

const config = {
  reactStrictMode: true,
  experimental: {
    nodeMiddleware: true,
  },
  images: {
    minimumCacheTTL: 300,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@taiyomoe/auth", "@taiyomoe/db", "@taiyomoe/utils"],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  /** PostHog-related configuration */
  rewrites: async () => [
    {
      source: "/ingest/static/:path*",
      destination: "https://us-assets.i.posthog.com/static/:path*",
    },
    {
      source: "/ingest/:path*",
      destination: "https://us.i.posthog.com/:path*",
    },
    {
      source: "/ingest/decide",
      destination: "https://us.i.posthog.com/decide",
    },
  ],
  skipTrailingSlashRedirect: true,
} satisfies NextConfig

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(config)
