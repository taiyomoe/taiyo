import type { DB, Kysely } from "@taiyomoe/db"
import { sql } from "@taiyomoe/db"

const iso = (column: "createdAt" | "finishedAt") =>
  sql<
    string | null
  >`to_char(${sql.ref(`mangaDexSyncs.${column}`)}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(column)

export const readMangaDexSyncs = async (
  db: Kysely<DB>,
  where: { mediaId: string; limit: number } | { id: string },
) => {
  const base = db
    .selectFrom("mangaDexSyncs")
    .innerJoin("users", "users.id", "mangaDexSyncs.userId")
    .select([
      "mangaDexSyncs.id",
      "mangaDexSyncs.mediaId",
      "mangaDexSyncs.status",
      "mangaDexSyncs.mangaDexId",
      "mangaDexSyncs.error",
      "mangaDexSyncs.summary",
      "users.id as userId",
      "users.name as userName",
      iso("createdAt"),
      iso("finishedAt"),
    ])
  const syncs = await (
    "id" in where
      ? base.where("mangaDexSyncs.id", "=", where.id)
      : base
          .where("mangaDexSyncs.mediaId", "=", where.mediaId)
          .orderBy("mangaDexSyncs.createdAt", "desc")
          .limit(where.limit)
  ).execute()
  const rows =
    syncs.length === 0
      ? []
      : await db
          .selectFrom("mangaDexSyncItems")
          .select(["syncId", "status", db.fn.countAll<string>().as("count")])
          .where(
            "syncId",
            "in",
            syncs.map((sync) => sync.id),
          )
          .groupBy(["syncId", "status"])
          .execute()

  return syncs.map(({ userId, userName, createdAt, ...sync }) => {
    const count = (status: string) =>
      Number(rows.find((row) => row.syncId === sync.id && row.status === status)?.count ?? 0)

    return {
      ...sync,
      createdAt: createdAt ?? "",
      user: { id: userId, name: userName },
      counts: {
        pending: count("PENDING"),
        done: count("DONE"),
        skipped: count("SKIPPED"),
        failed: count("FAILED"),
      },
    }
  })
}
