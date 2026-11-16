import type { DB, Kysely, UserLibraryStatus } from "@taiyomoe/db"

export const countLibraryEntries = async (db: Kysely<DB>, userId: string) => {
  const rows = await db
    .selectFrom("userLibraryEntries")
    .innerJoin("medias", "medias.id", "userLibraryEntries.mediaId")
    .where("userLibraryEntries.userId", "=", userId)
    .where("medias.deletedAt", "is", null)
    .select((eb) => ["userLibraryEntries.status", eb.fn.countAll<string>().as("count")])
    .groupBy("userLibraryEntries.status")
    .execute()
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
