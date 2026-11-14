import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const createClientEnv = (runtimeEnv: Record<string, string | boolean | undefined>) =>
  createEnv({
    clientPrefix: "VITE_",
    client: {
      VITE_MAINTENANCE_ENDS_AT: z.iso.datetime({ offset: true }).optional(),
      VITE_DISCORD_INVITE_URL: z.url().optional(),
    },
    runtimeEnv,
    emptyStringAsUndefined: true,
  })
