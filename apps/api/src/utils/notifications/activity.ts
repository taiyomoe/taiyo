import { config } from "@taiyomoe/config"
import { type DB, type Kysely, sql } from "@taiyomoe/db"

const ACTIVITY_SETTINGS = { FOLLOW: "notifyFollows", COMMENT_LIKE: "notifyLikes" } as const

/**
 * Adds `actorId` to the recipient's unread FOLLOW or COMMENT_LIKE notification, or opens a new
 * one once the previous is read. Each person counts once per target, so following again or
 * upvoting again never notifies twice. Resolves whether the recipient's notifications changed.
 * Must run in a transaction: it serialises concurrent events for the same target.
 */
export const recordActivity = async (
  db: Kysely<DB>,
  {
    type,
    recipientId,
    actorId,
    commentId = null,
  }: {
    type: keyof typeof ACTIVITY_SETTINGS
    recipientId: string
    actorId: string
    commentId?: string | null
  },
) => {
  const setting = ACTIVITY_SETTINGS[type]
  const recipient = await db
    .selectFrom("users")
    .select(
      sql<boolean>`coalesce(("settings" ->> ${setting})::boolean, ${config.settings[setting]})`.as(
        "enabled",
      ),
    )
    .where("id", "=", recipientId)
    .executeTakeFirst()

  if (recipient?.enabled !== true || recipientId === actorId) {
    return false
  }

  await sql`select pg_advisory_xact_lock(hashtextextended(${`notification:${type}:${recipientId}:${commentId ?? ""}`}, 0))`.execute(
    db,
  )

  const sameTarget = db
    .selectFrom("notifications as n")
    .where("n.userId", "=", recipientId)
    .where("n.type", "=", type)
    .where((eb) =>
      commentId === null ? eb("n.commentId", "is", null) : eb("n.commentId", "=", commentId),
    )
  const counted = await sameTarget
    .innerJoin("notificationActors as na", "na.notificationId", "n.id")
    .where("na.actorId", "=", actorId)
    .select("n.id")
    .executeTakeFirst()

  if (counted !== undefined) {
    return false
  }

  const open = await sameTarget
    .where("n.readAt", "is", null)
    .select("n.id")
    .orderBy("n.lastEventAt", "desc")
    .limit(1)
    .executeTakeFirst()
  const { id } =
    open === undefined
      ? await db
          .insertInto("notifications")
          .values({ userId: recipientId, type, commentId })
          .returning("id")
          .executeTakeFirstOrThrow()
      : await db
          .updateTable("notifications")
          .set({ lastEventAt: sql<Date>`CURRENT_TIMESTAMP` })
          .where("id", "=", open.id)
          .returning("id")
          .executeTakeFirstOrThrow()

  await db.insertInto("notificationActors").values({ notificationId: id, actorId }).execute()

  return true
}
