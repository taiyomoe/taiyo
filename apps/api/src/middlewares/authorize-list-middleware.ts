import type { Selectable, UserList } from "@taiyomoe/db"
import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"

export const authorizeList = (action: "update" | "delete") =>
  createMiddleware<{
    Variables: { can: Permissions; list: Selectable<UserList> }
  }>(async (c, next) => {
    if (!c.var.can(`list.${action}`, c.var.list)) {
      return c.fail("FORBIDDEN")
    }

    return next()
  })
