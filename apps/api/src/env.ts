import { createEnv } from "@t3-oss/env-core"
import { serverEnv as authEnv } from "@taiyomoe/auth/env-server"
import { env as dbEnv } from "@taiyomoe/db/env"
import { env as s3Env } from "@taiyomoe/s3/env"
import { env as searchEnv } from "@taiyomoe/search/env"
import { z } from "zod"

const isProduction = process.env.NODE_ENV === "production"

export const env = createEnv({
  extends: [authEnv, dbEnv, s3Env, searchEnv],

  shared: {},

  server: {
    PORT: z.coerce.number().int().positive().default(3002),
    HYPERDX_ENDPOINT: isProduction ? z.url() : z.url().optional(),
    HYPERDX_INGESTION_KEY: isProduction ? z.string().nonempty() : z.string().optional(),
    /**
     * Comma-separated list of origins allowed to call the API with credentials.
     * Empty / unset → CORS middleware disabled (same-origin only).
     */
    CORS_ALLOWED_ORIGINS: z.string().optional(),
  },

  clientPrefix: "NEXT_PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.TEST),
})
