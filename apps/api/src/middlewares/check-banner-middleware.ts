import type { Banner, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a banner row and exposes it on the
 * context as `c.var.banner`. The banner's `mediaId` is on the row for any
 * downstream handler that needs to act on the parent media.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `BANNER_NOT_FOUND` when no matching banner exists
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * banners. The default excludes soft-deleted rows.
 */
export const checkBanner = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { banner: Selectable<Banner> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ banner: { id } })

    const base = db.selectFrom("banners").selectAll().where("id", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const banner = await query.executeTakeFirst()

    if (!banner) {
      return c.fail("BANNER_NOT_FOUND")
    }

    log.set({ banner })

    c.set("banner", banner)

    await next()
  })
