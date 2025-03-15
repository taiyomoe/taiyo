import { createEnv } from "@t3-oss/env-core"
import { env as emailEnv } from "@taiyomoe/email/env"
import { z } from "zod"

export const env = createEnv({
  extends: [emailEnv],

  /**
   * Specify your shared environment variables schema here.
   */
  shared: {},

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_DISCORD_ID: z.string(),
    BETTER_AUTH_DISCORD_SECRET: z.string(),
    BETTER_AUTH_GOOGLE_ID: z.string(),
    BETTER_AUTH_GOOGLE_SECRET: z.string(),
    TURNSTILE_SECRET_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  clientPrefix: "NEXT_PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
})
