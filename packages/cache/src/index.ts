import DF from "ioredis"
import SuperJSON from "superjson"
import { env } from "./env"
import { parseCache } from "./utils/parse-cache"

const HOUR = 60 * 60
// const DAY = 60 * 60 * 24
const client = new DF(env.DRAGONFLY_URL)

export const cacheClient = {
  users: {
    /**
     * Queries
     */
    auth: {
      set: (id: string, value: string, ttl = 60) =>
        client.setex(`users:auth:${id}`, ttl, value),
      get: (id: string) => client.get(`users:auth:${id}`),
      invalidate: (id: string) =>
        client.del(`users:auth:${id}`).then(() => null),
    },
    verificationEmailSentAt: {
      set: (id: string, value: Date) =>
        client.setex(
          `users:verification-email-sent-at:${id}`,
          HOUR,
          SuperJSON.stringify(value),
        ),
      get: (id: string) =>
        parseCache<Date>(client.get(`users:verification-email-sent-at:${id}`)),
    },
  },
  clear: () => client.flushdb(),
}
