import { RedisStore, type RedisClient } from "@hono-rate-limiter/redis"
import { rawCacheClient } from "@taiyomoe/cache"
import { rateLimiter } from "hono-rate-limiter"

// hono-rate-limiter/redis expects an Upstash-style client; ioredis exposes
// the same primitives under different method names. Wrap once at module load.
const expectString = (value: unknown) => {
  if (typeof value !== "string") {
    throw new TypeError(`Expected a string reply, got ${typeof value}`)
  }

  return value
}
const adapter: RedisClient = {
  scriptLoad: (script) => rawCacheClient.script("LOAD", script).then(expectString),
  evalsha: <TData>(sha1: string, keys: string[], args: unknown[]) =>
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    rawCacheClient.evalsha(sha1, keys.length, ...keys, ...args.map(String)) as Promise<TData>,
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
    // oxlint-disable-next-line typescript/strict-void-return
    handler: (c) => c.fail("RATE_LIMITED"),
  })
