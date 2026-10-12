import type { Banner, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

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

    return next()
  })
