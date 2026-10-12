import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

const viteEnvSchema = z
  .record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.undefined()]))
  .optional()

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BETTER_AUTH_URL: z.url(),
    VITE_TURNSTILE_SITE_KEY: z.string(),
  },
  runtimeEnv:
    viteEnvSchema.parse((import.meta as { url: string; env?: unknown }).env) ?? process.env,
  skipValidation: Boolean(process.env.CI) || Boolean(process.env.TEST),
})
