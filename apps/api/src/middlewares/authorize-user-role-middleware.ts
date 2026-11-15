import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"

// Runs before the user is looked up, so a caller without the right learns nothing about the ID.
export const authorizeUserRole = createMiddleware<{ Variables: { can: Permissions } }>(
  async (c, next) => {
    if (!c.var.can("user.setRole", { id: c.req.param("id") ?? "" })) {
      return c.fail("FORBIDDEN")
    }

    return next()
  },
)
