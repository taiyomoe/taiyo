import type { Kysely } from "kysely"
import type { DB } from "../database"
import { readSampleRows } from "../sample"

export async function seed(db: Kysely<DB>): Promise<void> {
  const featured = await readSampleRows("featuredMedias")

  if (featured.length === 0) {
    return
  }

  const existing = await db
    .selectFrom("medias")
    .select("id")
    .where(
      "id",
      "in",
      featured.map((row) => row.mediaId),
    )
    .execute()
  const existingIds = new Set(existing.map((media) => media.id))
  const rows = featured
    .filter((row) => existingIds.has(row.mediaId))
    .map(({ mediaId, position }) => ({ mediaId, position }))

  if (rows.length === 0) {
    return
  }

  await db
    .insertInto("featuredMedias")
    .values(rows)
    .onConflict((oc) => oc.column("mediaId").doNothing())
    .execute()
}
