import type { User } from "@taiyomoe/auth/server"
import type { Selectable, UserList } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

/**
 * Allows the request only if the signed-in user owns the list exposed at
 * `c.var.list`.
 *
 * Must run after `withAuth(...)` and `checkList()` so both vars are set.
 */
export const requireListOwner = createMiddleware<{
  Variables: { user: User; list: Selectable<UserList> }
}>(async (c, next) => {
  if (c.var.user.id === c.var.list.userId) {
    return next()
  }

  return c.fail("FORBIDDEN")
})
