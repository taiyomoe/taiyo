import { createEnv } from "@t3-oss/env-core"
import { env as cacheEnv } from "@taiyomoe/cache/env"
import { env as dbEnv } from "@taiyomoe/db/env"
import { env as meilisearchEnv } from "@taiyomoe/meilisearch/env"
import { env as messagingEnv } from "@taiyomoe/messaging/env"
import { env as s3Env } from "@taiyomoe/s3/env"
import { env as utilsEnv } from "@taiyomoe/utils/env"

export const env = createEnv({
  extends: [cacheEnv, dbEnv, meilisearchEnv, messagingEnv, s3Env, utilsEnv],
  /**
   * Specify your shared environment variables schema here.
   */
  shared: {},

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},

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
