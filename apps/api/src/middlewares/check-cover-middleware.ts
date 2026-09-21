import type { Cover, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a cover row and exposes it on the
 * context as `c.var.cover`. The cover's `mediaId` is on the row for any
 * downstream handler that needs to act on the parent media (e.g. syncMedia).
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `COVER_NOT_FOUND` when no matching cover exists
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * covers. The default excludes soft-deleted rows.
 */
export const checkCover = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { cover: Selectable<Cover> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ cover: { id } })

    const base = db.selectFrom("covers").selectAll().where("id", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const cover = await query.executeTakeFirst()

    if (!cover) {
      return c.fail("COVER_NOT_FOUND")
    }

    log.set({ cover })

    c.set("cover", cover)

    await next()
  })
