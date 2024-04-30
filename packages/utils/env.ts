import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CDN_URL: z.string().url(),
    NEXT_PUBLIC_IO_URL: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
    NEXT_PUBLIC_IO_URL: process.env.NEXT_PUBLIC_IO_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
})
