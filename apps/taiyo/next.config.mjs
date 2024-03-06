// Importing env files here to validate on build
import "./src/lib/env.mjs"

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
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@taiyomoe/db",
    "@taiyomoe/services",
    "@taiyomoe/utils",
    "@taiyomoe/schemas",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
}

export default config
