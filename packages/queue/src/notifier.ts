import type { DB } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { sql, type Kysely } from "kysely"

type NotifierDeps = { db: Kysely<DB> }

const fanOutChapters = async (db: Kysely<DB>) => {
  const claimed = await db
    .deleteFrom("notificationOutbox")
    .where("id", "in", (eb) =>
      eb
        .selectFrom("notificationOutbox")
        .select("id")
        .orderBy("id")
        .limit(config.notifications.drainBatchSize)
        .forUpdate()
        .skipLocked(),
    )
    .returning("chapterId")
    .execute()
  const chapterIds = [...new Set(claimed.map(({ chapterId }) => chapterId))]

  if (chapterIds.length === 0) {
    return { chapters: 0, userIds: [] }
  }

  const { rows } = await sql<{ userId: string }>`
    INSERT INTO "notifications" ("userId", "type", "chapterId")
    SELECT DISTINCT "r"."userId", 'CHAPTER_PUBLISHED'::"NotificationType", "c"."id"
    FROM "chapters" AS "c"
    INNER JOIN "medias" AS "m" ON "m"."id" = "c"."mediaId" AND "m"."deletedAt" IS NULL
    CROSS JOIN LATERAL (
      SELECT "le"."userId"
      FROM "userLibraryEntries" AS "le"
      WHERE "le"."mediaId" = "c"."mediaId"
        AND "le"."notify"
        AND "le"."status" NOT IN ('DROPPED', 'COMPLETED')
      UNION
      SELECT "gf"."userId"
      FROM "chapterGroups" AS "cg"
      INNER JOIN "groups" AS "g" ON "g"."id" = "cg"."groupId" AND "g"."deletedAt" IS NULL
      INNER JOIN "groupFollows" AS "gf" ON "gf"."groupId" = "cg"."groupId"
      WHERE "cg"."chapterId" = "c"."id"
    ) AS "r"
    INNER JOIN "users" AS "u" ON "u"."id" = "r"."userId"
    WHERE "c"."id" IN (${sql.join(chapterIds)})
      AND "c"."status" = 'PUBLISHED'
      AND "c"."deletedAt" IS NULL
      AND "c"."createdAt" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(days => ${config.notifications.maxChapterAgeDays})
      AND "r"."userId" <> "c"."uploaderId"
      AND coalesce(("u"."settings" ->> 'notifyChapters')::boolean, ${config.settings.notifyChapters})
      AND jsonb_exists(
        coalesce("u"."settings" -> 'contentRating', ${JSON.stringify(config.settings.contentRating)}::jsonb),
        greatest("m"."contentRating", "c"."contentRating")::text
      )
    ON CONFLICT DO NOTHING
    RETURNING "userId"
  `.execute(db)

  return { chapters: chapterIds.length, userIds: rows.map(({ userId }) => userId) }
}

export const drainNotificationOutbox = async ({ db }: NotifierDeps) => {
  const totals = { chapters: 0, notifications: 0 }
  const userIds = new Set<string>()

  for (;;) {
    const batch = await db.transaction().execute(fanOutChapters)

    if (batch.chapters === 0) {
      return { ...totals, userIds: [...userIds] }
    }

    totals.chapters += batch.chapters
    totals.notifications += batch.userIds.length

    for (const userId of batch.userIds) {
      userIds.add(userId)
    }
  }
}

export const purgeNotifications = async ({ db }: NotifierDeps) => {
  const { readRetentionDays, unreadRetentionDays } = config.notifications
  const result = await db
    .deleteFrom("notifications")
    .where((eb) =>
      eb.or([
        eb(
          "readAt",
          "<",
          sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(days => ${readRetentionDays})`,
        ),
        eb(
          "createdAt",
          "<",
          sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(days => ${unreadRetentionDays})`,
        ),
      ]),
    )
    .executeTakeFirst()

  return { purged: Number(result.numDeletedRows) }
}
