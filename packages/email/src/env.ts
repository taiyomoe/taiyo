import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

// Production must be able to send mail. Elsewhere, unset credentials skip sending.
const credential =
  process.env.NODE_ENV === "production" ? z.string().min(1) : z.string().min(1).optional()

export const env = createEnv({
  shared: {},

  server: {
    SES_REGION: z.string().min(1).default("eu-central-1"),
    SES_ACCESS_KEY_ID: credential,
    SES_SECRET_ACCESS_KEY: credential,
  },

  clientPrefix: "NEXT_PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.TEST),
})
