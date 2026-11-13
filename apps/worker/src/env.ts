import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const isProduction = process.env.NODE_ENV === "production"

export const env = createEnv({
  server: {
    CHAPTER_PROCESSING_CONCURRENCY: z.coerce.number().int().positive().default(4),
    HYPERDX_ENDPOINT: isProduction ? z.url() : z.url().optional(),
    HYPERDX_INGESTION_KEY: isProduction ? z.string().nonempty() : z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: Boolean(process.env.TEST),
})
