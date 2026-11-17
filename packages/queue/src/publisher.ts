import type { DB } from "@taiyomoe/db"
import { sql, type Kysely } from "kysely"
import { awardMetricAchievements } from "./achievements"

export type PublisherDeps = { db: Kysely<DB> }

/**
 * Publishes the scheduled chapters whose time has come and awards their uploaders the
 * achievements it unlocks. Resolves the published chapters and the users who earned one.
 */
export const publishScheduledChapters = ({ db }: PublisherDeps) =>
  db.transaction().execute(async (trx) => {
    const published = await trx
      .updateTable("chapters")
      .set({ status: "PUBLISHED", createdAt: sql<Date>`"publishAt"` })
      .where("status", "=", "SCHEDULED")
      .where("deletedAt", "is", null)
      .where(sql<boolean>`"publishAt" <= (CURRENT_TIMESTAMP at time zone 'UTC')`)
      .returning(["id", "mediaId", "uploaderId"])
      .execute()
    const awardedUserIds: string[] = []

    for (const uploaderId of new Set(published.map((chapter) => chapter.uploaderId))) {
      if ((await awardMetricAchievements(trx, uploaderId)).length > 0) {
        awardedUserIds.push(uploaderId)
      }
    }

    return {
      published: published.length,
      chapters: published.map(({ id, mediaId }) => ({ id, mediaId })),
      awardedUserIds,
    }
  })
