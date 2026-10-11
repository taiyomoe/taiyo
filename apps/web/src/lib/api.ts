import type { AppType } from "@taiyomoe/api/app"
import { hc } from "hono/client"

import { env } from "@/env/client"

export const api = hc<AppType>(env.VITE_API_URL, {
  init: { credentials: "include" },
})
