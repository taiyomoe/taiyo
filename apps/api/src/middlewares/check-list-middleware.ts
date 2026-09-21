import type { Selectable, UserList } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a `userLists` row and exposes it on the
 * context as `c.var.list`. Soft-deleted rows are excluded.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `LIST_NOT_FOUND` when no matching list exists or it is soft-deleted
 */
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
