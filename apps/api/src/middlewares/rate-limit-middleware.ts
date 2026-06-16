import { RedisStore, type RedisClient } from "@hono-rate-limiter/redis"
import { cacheRedis } from "@taiyomoe/cache"
import { rateLimiter } from "hono-rate-limiter"

// hono-rate-limiter/redis expects an Upstash-style client; ioredis exposes
// the same primitives under different method names. Wrap once at module load.
const adapter: RedisClient = {
  scriptLoad: (script) => cacheRedis.script("LOAD", script) as Promise<string>,
  evalsha: <TArgs extends unknown[], TData = unknown>(sha1: string, keys: string[], args: TArgs) =>
    cacheRedis.evalsha(
      sha1,
      keys.length,
      ...keys,
      ...(args as (string | number)[]),
    ) as Promise<TData>,
  decr: (key) => cacheRedis.decr(key),
  del: (key) => cacheRedis.del(key),
}
// Default identifier: signed-in user id, then Cloudflare-supplied client IP,
// then the first hop of X-Forwarded-For, then a shared "anon" bucket. The
// shared bucket is intentionally coarse — it shouldn't be the dominant path
// in production once a reverse-proxy is wired.
const defaultKey = (
  c: Parameters<NonNullable<Parameters<typeof rateLimiter>[0]["keyGenerator"]>>[0],
) =>
  c.var.user?.id ??
  c.req.header("cf-connecting-ip") ??
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
  "anon"

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
    store: new RedisStore({ client: adapter, prefix: `rl:${prefix}:` }),
    windowMs,
    limit: (c) => (c.var.user?.role === "ADMIN" ? Number.POSITIVE_INFINITY : limit),
    standardHeaders: "draft-7",
    keyGenerator: defaultKey,
    handler: (c) => c.fail("RATE_LIMITED"),
  })
