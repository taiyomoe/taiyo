import { createEnv } from "@t3-oss/env-nextjs"
import { env as authEnv } from "@taiyomoe/auth/env"
import { z } from "zod"

export const env = createEnv({
  extends: [authEnv],

  /**
   * Specify your shared environment variables schema here.
   */
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_POSTHOG_HOST: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
})
