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
}

export default config
