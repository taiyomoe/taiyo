import type { Chapter, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

export const checkChapter = (opts: { includeDeleted?: boolean; unpublished?: boolean } = {}) =>
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

    const base = db.selectFrom("chapters").selectAll().where("id", "=", id)
    const visible = opts.unpublished === true ? base : base.where("status", "=", "PUBLISHED")
    const query = opts.includeDeleted === true ? visible : visible.where("deletedAt", "is", null)
    const chapter = await query.executeTakeFirst()

    if (!chapter) {
      return c.fail("CHAPTER_NOT_FOUND")
    }

    log.set({ chapter })

    c.set("chapter", chapter)

    return next()
  })
