import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  shared: {},

  server: {
    RESEND_API_KEY: z.string().nonempty(),
  },

  clientPrefix: "NEXT_PUBLIC_",
  client: {},

  runtimeEnv: process.env,
  skipValidation:
    Boolean(process.env.CI) ||
    Boolean(process.env.TEST) ||
    process.env.npm_lifecycle_event === "lint",
})
