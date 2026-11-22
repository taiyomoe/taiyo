import type { NotificationEvents } from "@taiyomoe/cache/notification-events"
import type z from "zod"
import { config } from "@taiyomoe/config"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import type { moderationPayloadSchemas } from "./schemas"

type ModerationNotice = {
  [Type in keyof typeof moderationPayloadSchemas]: {
    type: Type
    userId: string
    payload: z.infer<(typeof moderationPayloadSchemas)[Type]>
  }
}[keyof typeof moderationPayloadSchemas]

/** What a route that notifies of a moderation action has once it is signed in and in a transaction. */
export type ModerationContext = {
  db: Kysely<DB>
  user: { id: string }
  afterCommit: (callback: () => Promise<void>) => void
  notificationEvents: NotificationEvents
}

/**
 * Tells people what the moderation team did to their lists, their profile or their reports: one
 * notification per notice, never gathered, and none for the moderator who acted. Nobody can turn
 * these off. The inboxes hear of them once the transaction commits.
 */
export const notifyModeration = async (
  { db, user, afterCommit, notificationEvents }: ModerationContext,
  notices: readonly ModerationNotice[],
) => {
  // Reports the moderation team acted on earn their reporter a few points, told in the notice.
  const kept = notices
    .filter((notice) => notice.userId !== user.id)
    .map((notice) =>
      notice.type === "REPORT_REVIEWED" && notice.payload.outcome === "RESOLVED"
        ? { ...notice, payload: { ...notice.payload, points: config.reports.rewardPoints } }
        : notice,
    )

  if (kept.length === 0) {
    return
  }

  await db
    .insertInto("notifications")
    .values(kept.map(({ type, userId, payload }) => ({ type, userId, payload })))
    .execute()

  const rewards = new Map<string, number>()

  for (const notice of kept) {
    if (notice.type === "REPORT_REVIEWED" && notice.payload.points !== undefined) {
      rewards.set(notice.userId, (rewards.get(notice.userId) ?? 0) + notice.payload.points)
    }
  }

  for (const [userId, points] of rewards) {
    await db
      .insertInto("userProfiles")
      .values({ userId, points })
      .onConflict((oc) =>
        oc
          .column("userId")
          .doUpdateSet({ points: sql<number>`"userProfiles"."points" + ${points}` }),
      )
      .execute()
  }

  afterCommit(() => notificationEvents.publish([...new Set(kept.map(({ userId }) => userId))]))
}
