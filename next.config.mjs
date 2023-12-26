// Importing env files here to validate on build
import "./src/lib/env.mjs"

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 300,
    domains: ["cdn.discordapp.com", "asset.brandfetch.io", "flagcdn.com"],
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
    ],
  },
  experimental: {
    serverActions: true,
  },
}

export default config
