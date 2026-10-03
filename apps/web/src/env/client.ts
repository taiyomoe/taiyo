import { createEnv } from "@t3-oss/env-core"
import { clientEnv as authEnv } from "@taiyomoe/auth/env-client"
import { z } from "zod"

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: "VITE_",
  client: {
    VITE_SUPPORT_EMAIL: z.email().default("support@taiyo.moe"),
    VITE_API_URL: z.url(),
  },
  runtimeEnv: import.meta.env,
})
