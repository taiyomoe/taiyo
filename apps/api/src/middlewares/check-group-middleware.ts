import type { Group, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

export const checkGroup = (opts: { includeDeleted?: boolean } = {}) =>
  createMiddleware<{
    Variables: { group: Selectable<Group> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ group: { id } })

    const base = db.selectFrom("groups").selectAll().where("id", "=", id)
    const query = opts.includeDeleted ? base : base.where("deletedAt", "is", null)
    const group = await query.executeTakeFirst()

    if (!group) {
      return c.fail("GROUP_NOT_FOUND")
    }

    log.set({ group })

    c.set("group", group)

    return next()
  })
