import type { Banner, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
  bannerId: z.uuid(),
})

/**
 * Resolves the `:bannerId` path parameter to a banner row scoped to the
 * `:id` media and exposes it on the context as `c.var.banner`.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when either id is not a UUID
 *   - `BANNER_NOT_FOUND` when no matching banner exists under that media
 *
 * Pass `{ includeDeleted: true }` for routes that operate on soft-deleted
 * banners. The default excludes soft-deleted rows.
 */
export const checkBanner = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { banner: Selectable<Banner> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({
      id: c.req.param("id"),
      bannerId: c.req.param("bannerId"),
    })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id, bannerId } = parsed.data
    const { db, log } = c.var

    log.set({ banner: { id: bannerId } })

    const base = db
      .selectFrom("banners")
      .selectAll()
      .where("id", "=", bannerId)
      .where("mediaId", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const banner = await query.executeTakeFirst()

    if (!banner) {
      return c.fail("BANNER_NOT_FOUND")
    }

    log.set({ banner })

    c.set("banner", banner)

    await next()
  })
