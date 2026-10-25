import type { DB } from "@taiyomoe/db"
import { sql, type Kysely } from "kysely"

export type PublisherDeps = { db: Kysely<DB> }

export const publishScheduledChapters = async ({ db }: PublisherDeps) => {
  const published = await db
    .updateTable("chapters")
    .set({ status: "PUBLISHED", createdAt: sql<Date>`"publishAt"` })
    .where("status", "=", "SCHEDULED")
    .where("deletedAt", "is", null)
    .where(sql<boolean>`"publishAt" <= (CURRENT_TIMESTAMP at time zone 'UTC')`)
    .returning("id")
    .execute()

  return { published: published.length }
}
