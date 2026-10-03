import type { Chapter, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a chapter row and exposes it on the
 * context as `c.var.chapter`. The chapter's `mediaId` is on the row for any
 * downstream handler that needs to act on the parent media.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `CHAPTER_NOT_FOUND` when no matching chapter exists
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * chapters. The default excludes soft-deleted rows.
 */
export const checkChapter = (opts: { includeDeleted?: boolean } = {}) =>
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
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const chapter = await query.executeTakeFirst()

    if (!chapter) {
      return c.fail("CHAPTER_NOT_FOUND")
    }

    log.set({ chapter })

    c.set("chapter", chapter)

    await next()
  })
