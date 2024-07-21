import { createEnv } from "@t3-oss/env-nextjs"
import { vercel } from "@t3-oss/env-nextjs/presets"
import { env as authEnv } from "@taiyomoe/auth/env"
import { env as meilisearchEnv } from "@taiyomoe/meilisearch/env"
import { env as utilsEnv } from "@taiyomoe/utils/env"

export const env = createEnv({
  extends: [authEnv, meilisearchEnv, utilsEnv, vercel()],

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
  client: {},

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {},

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
})
