import type { Cover, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

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

    return next()
  })
