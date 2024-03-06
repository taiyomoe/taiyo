import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SOKETI_HOST: z.string(),
    NEXT_PUBLIC_SOKETI_PORT: z.coerce.number(),
    NEXT_PUBLIC_SOKETI_APP_KEY: z.string().default(""),
  },
  server: {
    SOKETI_APP_ID: z.string(),
    SOKETI_APP_SECRET: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SOKETI_HOST: process.env.NEXT_PUBLIC_SOKETI_HOST,
    NEXT_PUBLIC_SOKETI_PORT: process.env.NEXT_PUBLIC_SOKETI_PORT,
    NEXT_PUBLIC_SOKETI_APP_KEY: process.env.NEXT_PUBLIC_SOKETI_APP_KEY,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
})
