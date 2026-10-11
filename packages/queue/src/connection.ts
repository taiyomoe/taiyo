import { env } from "./env"

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
