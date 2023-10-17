// Importing env files here to validate on build
import "./src/lib/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.taiyo.moe", "cdn.discordapp.com"],
  },
  experimental: {
    serverActions: true,
  },
};

export default config;
