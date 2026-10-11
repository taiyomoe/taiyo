import type { Media, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

export const checkMedia = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { media: Selectable<Media> }
  }>(async (c, next) => {
    const parsed = z.uuid().safeParse(c.req.param("id"))

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const id = parsed.data
    const { db, log } = c.var

    log.set({ media: { id } })

    const base = db.selectFrom("medias").selectAll().where("id", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const media = await query.executeTakeFirst()

    if (!media) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    log.set({ media })

    c.set("media", media)

    await next()
  })
