import DF from "ioredis"
import { z } from "zod"
import { env } from "./env"

const CHANNEL = "notifications:changed"
const BATCH_SIZE = 1000
const messageSchema = z.array(z.string())

export type NotificationEvents = {
  publish: (userIds: readonly string[]) => Promise<void>
  subscribe: (userId: string, listener: () => void) => () => void
}

export const createNotificationEvents = (url = env.DRAGONFLY_URL): NotificationEvents => {
  const publisher = new DF(url, { lazyConnect: true })
  const listeners = new Map<string, Set<() => void>>()
  let subscriber: DF | null = null
  const listen = () => {
    subscriber = new DF(url)
    subscriber.on("message", (_channel: string, message: string) => {
      const parsed = messageSchema.safeParse(JSON.parse(message))

      for (const userId of parsed.success ? parsed.data : []) {
        for (const listener of listeners.get(userId) ?? []) {
          listener()
        }
      }
    })
    void subscriber.subscribe(CHANNEL)
  }

  return {
    publish: async (userIds) => {
      const unique = [...new Set(userIds)]

      for (let i = 0; i < unique.length; i += BATCH_SIZE) {
        await publisher.publish(CHANNEL, JSON.stringify(unique.slice(i, i + BATCH_SIZE)))
      }
    },
    subscribe: (userId, listener) => {
      if (subscriber === null) {
        listen()
      }

      const set = listeners.get(userId) ?? new Set()

      set.add(listener)
      listeners.set(userId, set)

      return () => {
        set.delete(listener)

        if (set.size === 0) {
          listeners.delete(userId)
        }
      }
    },
  }
}
