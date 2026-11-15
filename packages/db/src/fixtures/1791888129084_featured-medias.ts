import type { Kysely } from "kysely"
import type { DB } from "../database"

const FEATURED_MEDIA_IDS = [
  "7a99da64-56e7-4bf6-8159-8db0d3b4f231",
  "167a77d9-ce98-4b81-9635-ed9b237c8b4e",
  "0da55f8e-4715-48e8-8d6a-84f632fca9c2",
  "fe804e63-5379-40ee-b114-d372f0ced531",
  "98b0c446-e571-4854-9e7c-b1b36eedc3ec",
  "122ad912-07ff-4649-bd80-82d152b20e5d",
  "cd8a62a2-dc85-4342-a2a0-6e17d16632fd",
  "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  "861ec3a1-2cff-4e8f-b9fd-b5e41f741970",
  "104a9efc-ef2a-4bf4-807b-2d949d78e3b6",
]

export async function seed(db: Kysely<DB>): Promise<void> {
  const existing = await db
    .selectFrom("medias")
    .select("id")
    .where("id", "in", FEATURED_MEDIA_IDS)
    .execute()
  const existingIds = new Set(existing.map((media) => media.id))
  const rows = FEATURED_MEDIA_IDS.flatMap((mediaId, position) =>
    existingIds.has(mediaId) ? [{ mediaId, position }] : [],
  )

  if (rows.length === 0) {
    return
  }

  await db
    .insertInto("featuredMedias")
    .values(rows)
    .onConflict((oc) => oc.column("mediaId").doNothing())
    .execute()
}
