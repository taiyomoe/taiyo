import { clientEnv } from "@taiyomoe/auth/env-client"
import { createMiddleware } from "hono/factory"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const originOf = (url: string | undefined) => {
  try {
    return url === undefined ? null : new URL(url).origin
  } catch {
    return null
  }
}

/**
 * Refuses state-changing requests that a browser sends from a page outside the allowed origins.
 * CORS only hides the response: a form or `text/plain` request still runs with the session
 * cookie. Browsers send `Origin` on every non-GET request, so requests without one come from
 * servers (the web app's SSR, scripts) and are left alone.
 */
export const checkOrigin = (allowedOrigins: readonly string[]) =>
  createMiddleware(async (c, next) => {
    const origin = c.req.header("origin")

    // Better Auth checks its own routes against its trusted origins.
    if (
      SAFE_METHODS.has(c.req.method) ||
      origin === undefined ||
      c.req.path.startsWith("/api/auth/")
    ) {
      return next()
    }

    const allowed = new Set([
      ...allowedOrigins,
      originOf(c.req.url),
      originOf(clientEnv.VITE_BETTER_AUTH_URL),
    ])

    if (!allowed.has(origin)) {
      return c.fail("FORBIDDEN")
    }

    return next()
  })
