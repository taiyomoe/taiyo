import { RedisStore, type RedisClient } from "@hono-rate-limiter/redis"
import { rawCacheClient } from "@taiyomoe/cache"
import { rateLimiter } from "hono-rate-limiter"

/**
 * Builds a rate-limit middleware backed by the shared Dragonfly client.
 *
 * Routes share one Dragonfly DB with better-auth's secondary storage; the
 * `prefix` parameter keeps the per-route counter namespaces from colliding.
 *
 * Admins are exempt — moderation work isn't bounded by these per-route
 * budgets. Authenticated USER+ get keyed on user id; anonymous requests
 * fall back to the client IP.
 */
export const rateLimit = ({
  prefix,
  windowMs,
  limit,
}: {
  prefix: string
  windowMs: number
  limit: number
}) =>
  rateLimiter({
    store: new RedisStore({
      client: rawCacheClient as unknown as RedisClient,
      prefix: `rl:${prefix}:`,
    }),
    windowMs,
    limit: (c) => (c.var.user?.role === "ADMIN" ? Number.POSITIVE_INFINITY : limit),
    standardHeaders: "draft-7",
    keyGenerator: (c) =>
      c.var.user?.id ??
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anon",
    handler: (c) => c.fail("RATE_LIMITED"),
  })
