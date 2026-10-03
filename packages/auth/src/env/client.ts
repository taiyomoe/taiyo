import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BETTER_AUTH_URL: z.url(),
    VITE_TURNSTILE_SITE_KEY: z.string(),
  },
  runtimeEnv: (import.meta as unknown as { env: Record<string, string | undefined> }).env,
  skipValidation: !!process.env.CI || !!process.env.TEST,
})
