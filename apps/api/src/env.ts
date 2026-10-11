import { createEnv } from "@t3-oss/env-core"
import { serverEnv as authEnv } from "@taiyomoe/auth/env-server"
import { env as dbEnv } from "@taiyomoe/db/env"
import { env as s3Env } from "@taiyomoe/s3/env"
import { env as searchEnv } from "@taiyomoe/search/env"
import { z } from "zod"

const isProduction = process.env.NODE_ENV === "production"

export const env = createEnv({
  extends: [authEnv, dbEnv, s3Env, searchEnv],

  /**
   * Specify your shared environment variables schema here.
   */
  shared: {},

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    PORT: z.coerce.number().int().positive().default(3002),
    HYPERDX_ENDPOINT: isProduction ? z.url() : z.url().optional(),
    HYPERDX_INGESTION_KEY: isProduction ? z.string().nonempty() : z.string().optional(),
    /**
     * Comma-separated list of origins allowed to call the API with credentials.
     * Empty / unset → CORS middleware disabled (same-origin only).
     */
    CORS_ALLOWED_ORIGINS: z.string().default(""),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  clientPrefix: "NEXT_PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation:
    !!process.env.CI || !!process.env.TEST || process.env.npm_lifecycle_event === "lint",
})
