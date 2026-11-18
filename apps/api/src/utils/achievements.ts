import type { NotificationEvents } from "@taiyomoe/cache/notification-events"
import type { DB, Kysely } from "@taiyomoe/db"
import { awardMetricAchievements } from "@taiyomoe/queue"

/** The keys of the achievements the user holds. */
export const getHeldAchievements = async (db: Kysely<DB>, userId: string) => {
  const rows = await db
    .selectFrom("userAchievements")
    .select("key")
    .where("userId", "=", userId)
    .execute()

  return new Set(rows.map((row) => row.key))
}

/**
 * Awards the metric achievements `userId` just reached, in the request's transaction, and tells
 * their open tabs once it commits.
 */
export const awardAchievements = async (
  {
    db,
    afterCommit,
    notificationEvents,
  }: {
    db: Kysely<DB>
    afterCommit: (cb: () => Promise<void>) => void
    notificationEvents: NotificationEvents
  },
  userId: string,
) => {
  const earned = await awardMetricAchievements(db, userId)

  if (earned.length > 0) {
    afterCommit(() => notificationEvents.publish([userId]))
  }
}
