import { RedisStore, type RedisClient } from "@hono-rate-limiter/redis"
import { rawCacheClient } from "@taiyomoe/cache"
import { rateLimiter } from "hono-rate-limiter"

// hono-rate-limiter/redis expects an Upstash-style client; ioredis exposes
// the same primitives under different method names. Wrap once at module load.
const adapter: RedisClient = {
  scriptLoad: (script) => rawCacheClient.script("LOAD", script) as Promise<string>,
  evalsha: <TArgs extends unknown[], TData = unknown>(sha1: string, keys: string[], args: TArgs) =>
    rawCacheClient.evalsha(
      sha1,
      keys.length,
      ...keys,
      ...(args as (string | number)[]),
    ) as Promise<TData>,
  decr: (key) => rawCacheClient.decr(key),
  del: (key) => rawCacheClient.del(key),
}

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
    keyGenerator: (c) =>
      c.var.user?.id ??
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      "anon",
    handler: (c) => c.fail("RATE_LIMITED"),
  })
