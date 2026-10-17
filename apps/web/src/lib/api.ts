import type { AppType } from "@taiyomoe/api/app"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"
import { hc } from "hono/client"
import { env } from "@/env/client"

const getForwardedHeaders = createIsomorphicFn()
  .server((): Record<string, string> => {
    const cookie = getRequestHeader("cookie")

    return cookie === undefined ? {} : { cookie }
  })
  .client((): Record<string, string> => ({}))

export const api = hc<AppType>(env.VITE_API_URL, {
  headers: getForwardedHeaders,
  init: { credentials: "include" },
})
