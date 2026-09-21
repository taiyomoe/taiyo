import { createEnv } from "@t3-oss/env-core"
import { clientEnv as authEnv } from "@taiyomoe/auth/env-client"
import { z } from "zod"

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: "VITE_",
  client: {
    /** Where copyright notices, privacy requests and general support mail go. */
    VITE_SUPPORT_EMAIL: z.email().default("support@taiyo.moe"),
  },
  runtimeEnv: import.meta.env,
})
