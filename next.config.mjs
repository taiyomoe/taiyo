// Importing env files here to validate on build
import "./src/lib/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 300,
    domains: ["cdn.discordapp.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.taiyo.moe",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

export default config;
