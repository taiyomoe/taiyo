import type { Cover, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
  coverId: z.uuid(),
})

/**
 * Resolves the `:coverId` path parameter to a cover row scoped to the
 * `:id` media and exposes it on the context as `c.var.cover`.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when either id is not a UUID
 *   - `COVER_NOT_FOUND` when no matching cover exists under that media
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * covers. The default excludes soft-deleted rows.
 */
export const checkCover = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { cover: Selectable<Cover> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({
      id: c.req.param("id"),
      coverId: c.req.param("coverId"),
    })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id, coverId } = parsed.data
    const { db, log } = c.var

    log.set({ cover: { id: coverId } })

    const base = db
      .selectFrom("covers")
      .selectAll()
      .where("id", "=", coverId)
      .where("mediaId", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const cover = await query.executeTakeFirst()

    if (!cover) {
      return c.fail("COVER_NOT_FOUND")
    }

    log.set({ cover })

    c.set("cover", cover)

    await next()
  })
