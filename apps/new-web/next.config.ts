import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import "./src/env"

const config = {
  reactStrictMode: true,

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@taiyomoe/auth", "@taiyomoe/db"],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(config)
