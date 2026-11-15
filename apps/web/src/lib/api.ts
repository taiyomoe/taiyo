import type { AppType } from "@taiyomoe/api/app"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"
import { hc } from "hono/client"
import { env } from "@/env/client"

// The server can reach the api without going through Cloudflare, which would replace the
// visitor's cf-connecting-ip with the web server's own address.
const getApiUrl = createIsomorphicFn()
  .server(() => process.env.API_INTERNAL_URL ?? env.VITE_API_URL)
  .client(() => env.VITE_API_URL)
// The api rate-limits anonymous calls by client IP: forwarding the visitor's keeps every
// visitor's server-rendered requests from sharing the web server's budget.
const getForwardedHeaders = createIsomorphicFn()
  .server(() => {
    const headers: Record<string, string> = {}
    const cookie = getRequestHeader("cookie")
    const clientIp = getRequestHeader("cf-connecting-ip")

    if (cookie !== undefined) {
      headers.cookie = cookie
    }

    if (clientIp !== undefined) {
      headers["cf-connecting-ip"] = clientIp
    }

    return headers
  })
  .client((): Record<string, string> => ({}))

export const api = hc<AppType>(getApiUrl(), {
  headers: getForwardedHeaders,
  init: { credentials: "include" },
})
