// Importing env files here to validate on build
import "./src/lib/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 300,
    domains: ["cdn.discordapp.com", "asset.brandfetch.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.taiyo.moe",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-5836e59af07c42f5a76a222d3bd93bb0.r2.dev",
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
