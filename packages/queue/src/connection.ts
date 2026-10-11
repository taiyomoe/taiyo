import { env } from "./env"

// BullMQ requires maxRetriesPerRequest: null. Pass raw options (not a
// pre-constructed ioredis instance) so BullMQ creates its own connection
// per queue/worker — the documented best practice.
export const createBullConnection = () => ({
  ...parseRedisUrl(env.DRAGONFLY_URL),
  maxRetriesPerRequest: null as null,
})

function parseRedisUrl(url: string) {
  const parsed = new URL(url)

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    ...(parsed.password ? { password: parsed.password } : {}),
    ...(parsed.username ? { username: parsed.username } : {}),
  }
}
