import type { NotificationEvents } from "@taiyomoe/cache/notification-events"

export const createMemoryNotificationEvents = () => {
  const listeners = new Map<string, Set<() => void>>()
  const published: string[] = []

  return {
    published,
    publish: (userIds) => {
      published.push(...userIds)

      for (const userId of userIds) {
        for (const listener of listeners.get(userId) ?? []) {
          listener()
        }
      }

      return Promise.resolve()
    },
    subscribe: (userId, listener) => {
      const set = listeners.get(userId) ?? new Set()

      set.add(listener)
      listeners.set(userId, set)

      return () => {
        set.delete(listener)
      }
    },
  } satisfies NotificationEvents & { published: string[] }
}
