import type { User } from "@taiyomoe/auth/server"
import type { Selectable, UserList } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

export const requireListOwner = createMiddleware<{
  Variables: { user: User; list: Selectable<UserList> }
}>(async (c, next) => {
  if (c.var.user.id === c.var.list.userId) {
    return next()
  }

  return c.fail("FORBIDDEN")
})
