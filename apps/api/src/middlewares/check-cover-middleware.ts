import type { Cover, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"
import { withRequestSpec } from "../utils/openapi-helper"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
})

export const checkCover = (opts: { includeDeleted?: boolean } = {}) =>
  withRequestSpec(
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
      const query = opts.includeDeleted === true ? base : base.where("deletedAt", "is", null)
      const cover = await query.executeTakeFirst()

      if (!cover) {
        return c.fail("COVER_NOT_FOUND")
      }

      log.set({ cover })

      c.set("cover", cover)

      return next()
    }),
    "param",
    paramSchema,
  )
