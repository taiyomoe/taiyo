import type { DB, Kysely } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import z from "zod"

export const chapterIdsSchema = z
  .array(z.uuid())
  .min(1)
  .max(config.input.maxReviewBatch)
  .transform((ids) => [...new Set(ids)])
  .meta({ description: "The chapters to act on." })

export const skippedChapterSchema = z.object({
  id: z.uuid(),
  reason: z.enum(["NOT_FOUND", "NOT_PENDING", "PAGES_MISSING"]).meta({
    description:
      "Why the chapter was left alone: it does not exist, it is not waiting for review, or its pages are not processed yet.",
  }),
})

export const lockReviewableChapters = async (db: Kysely<DB>, ids: readonly string[]) => {
  const rows = await db
    .selectFrom("chapters")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .select(["chapters.id", "chapters.mediaId", "chapters.status", "chapters.pages"])
    .where("chapters.id", "in", ids)
    .where("chapters.deletedAt", "is", null)
    .where("medias.deletedAt", "is", null)
    .forUpdate("chapters")
    .execute()
  const found = new Map(rows.map((row) => [row.id, row]))

  return ids.map((id) => ({ id, row: found.get(id) }))
}
