import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const serverEnv = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string(),
    /** Parent domain shared by the web and the api, e.g. `taiyo.moe`. Unset → host-only cookies. */
    BETTER_AUTH_COOKIE_DOMAIN: z.string().optional(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    TURNSTILE_SECRET_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: Boolean(process.env.TEST),
})
