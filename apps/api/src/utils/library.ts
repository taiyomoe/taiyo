import type { DB, Kysely, UserLibraryStatus } from "@taiyomoe/db"

const toLibraryCounts = (rows: Array<{ status: UserLibraryStatus; count: string }>) => {
  const countOf = (status: UserLibraryStatus) =>
    Number(rows.find((row) => row.status === status)?.count ?? 0)
  const byStatus = {
    READING: countOf("READING"),
    REREADING: countOf("REREADING"),
    PLAN_TO_READ: countOf("PLAN_TO_READ"),
    COMPLETED: countOf("COMPLETED"),
    ON_HOLD: countOf("ON_HOLD"),
    DROPPED: countOf("DROPPED"),
  }

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
  }
}

export const countLibraryEntries = async (db: Kysely<DB>, userId: string) =>
  toLibraryCounts(
    await db
      .selectFrom("userLibraryEntries")
      .innerJoin("medias", "medias.id", "userLibraryEntries.mediaId")
      .where("userLibraryEntries.userId", "=", userId)
      .where("medias.deletedAt", "is", null)
      .select((eb) => ["userLibraryEntries.status", eb.fn.countAll<string>().as("count")])
      .groupBy("userLibraryEntries.status")
      .execute(),
  )

export const countMediaLibraryEntries = async (db: Kysely<DB>, mediaId: string) =>
  toLibraryCounts(
    await db
      .selectFrom("userLibraryEntries")
      .where("mediaId", "=", mediaId)
      .select((eb) => ["status", eb.fn.countAll<string>().as("count")])
      .groupBy("status")
      .execute(),
  )
