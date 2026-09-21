import type { Selectable, User } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"

const paramSchema = z.object({
  id: z.uuid(),
})

/**
 * Resolves the `:id` path parameter to a users row and exposes it on the
 * context as `c.var.targetUser`. Distinct from `c.var.user` which is the
 * authenticated caller.
 *
 * Rejects with:
 *   - `VALIDATION_ERROR` when the id is not a UUID
 *   - `USER_NOT_FOUND` when no matching user exists or the user is banned
 */
export const checkUser = () =>
  createMiddleware<{
    Variables: { targetUser: Selectable<User> }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { db, log } = c.var

    log.set({ targetUser: { id } })

    const targetUser = await db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .where((eb) => eb.or([eb("banned", "is", null), eb("banned", "=", false)]))
      .executeTakeFirst()

    if (!targetUser) {
      return c.fail("USER_NOT_FOUND")
    }

    log.set({ targetUser })

    c.set("targetUser", targetUser)

    await next()
  })
