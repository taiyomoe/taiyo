import type { Chapter, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"
import { withRequestSpec } from "../utils/openapi-helper"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
})

export const checkChapter = (
  opts: { includeDeleted?: boolean; unpublished?: boolean; refuseLocked?: boolean } = {},
) =>
  withRequestSpec(
    createMiddleware<{
      Variables: { chapter: Selectable<Chapter> }
    }>(async (c, next) => {
      const parsed = paramSchema.safeParse({ id: c.req.param("id") })

      if (!parsed.success) {
        return c.fail("VALIDATION_ERROR", parsed.error.issues)
      }

      const { id } = parsed.data
      const { db, log } = c.var

      log.set({ chapter: { id } })

      const base = db
        .selectFrom("chapters")
        .innerJoin("medias", "medias.id", "chapters.mediaId")
        .selectAll("chapters")
        .select("medias.flag as mediaFlag")
        .where("chapters.id", "=", id)
      const visible =
        opts.unpublished === true ? base : base.where("chapters.status", "=", "PUBLISHED")
      const query =
        opts.includeDeleted === true
          ? visible
          : visible.where("chapters.deletedAt", "is", null).where("medias.deletedAt", "is", null)
      const row = await query.executeTakeFirst()

      if (!row) {
        return c.fail("CHAPTER_NOT_FOUND")
      }

      const { mediaFlag, ...chapter } = row

      if (opts.refuseLocked === true && mediaFlag === "LOCKED") {
        return c.fail("MEDIA_LOCKED", { mediaId: chapter.mediaId })
      }

      log.set({ chapter })

      c.set("chapter", chapter)

      return next()
    }),
    "param",
    paramSchema,
  )
