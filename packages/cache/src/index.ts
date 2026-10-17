import DF from "ioredis"
import SuperJSON from "superjson"
import { env } from "./env"
import { parseCache } from "./utils/parse-cache"

const HOUR = 60 * 60
const client = new DF(env.DRAGONFLY_URL)
const INCREMENT_WITH_TTL = `
local value = redis.call('INCR', KEYS[1])
if value == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return value
`
const expectNumber = (value: unknown) => {
  if (typeof value !== "number") {
    throw new TypeError(`Expected a number reply, got ${typeof value}`)
  }

  return value
}

export const rawCacheClient = client

export const cacheClient = {
  users: {
    auth: {
      set: (id: string, value: string, ttl = 60) => client.setex(`users:auth:${id}`, ttl, value),
      get: (id: string) => client.get(`users:auth:${id}`),
      invalidate: (id: string) => client.del(`users:auth:${id}`).then(() => null),
      getAndDelete: (id: string) => client.getdel(`users:auth:${id}`),
      increment: (id: string, ttl: number) =>
        client.eval(INCREMENT_WITH_TTL, 1, `users:auth:${id}`, ttl).then(expectNumber),
    },
    verificationEmailSentAt: {
      set: (id: string, value: Date) =>
        client.setex(`users:verification-email-sent-at:${id}`, HOUR, SuperJSON.stringify(value)),
      get: (id: string) => parseCache<Date>(client.get(`users:verification-email-sent-at:${id}`)),
    },
  },
  dashboard: {
    overview: {
      set: (key: string, value: unknown, ttl: number) =>
        client.setex(`dashboard:overview:${key}`, ttl, SuperJSON.stringify(value)),
      get: <T>(key: string) => parseCache<T>(client.get(`dashboard:overview:${key}`)),
    },
  },
  clear: () => client.flushdb(),
}
