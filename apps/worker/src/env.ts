import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    CHAPTER_PROCESSING_CONCURRENCY: z.coerce.number().int().positive().default(4),
  },
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI || !!process.env.TEST || process.env.npm_lifecycle_event === "lint",
})
