import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  shared: {},
  server: {
    MEILISEARCH_HOST: z.url(),
    MEILISEARCH_API_KEY: z.string().nonempty(),
  },
  clientPrefix: "NEXT_PUBLIC_",
  client: {},
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || !!process.env.TEST || process.env.npm_lifecycle_event === "lint",
})
