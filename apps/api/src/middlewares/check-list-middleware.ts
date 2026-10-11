import type { Selectable, UserList } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

export const checkList = () =>
  createMiddleware<{
    Variables: { list: Selectable<UserList> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ list: { id } })

    const list = await db
      .selectFrom("userLists")
      .selectAll()
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!list) {
      return c.fail("LIST_NOT_FOUND")
    }

    log.set({ list })

    c.set("list", list)

    await next()
  })
