import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"

// Runs before the user is looked up, so a caller without the right learns nothing about the ID.
// `ban` also depends on the target's role: checking it against a `USER`, the least protected role,
// refuses whoever cannot ban anyone. The handler checks again once the target is loaded.
export const authorizeUser = (action: "ban" | "setRole") =>
  createMiddleware<{ Variables: { can: Permissions } }>(async (c, next) => {
    const id = c.req.param("id") ?? ""
    const allowed =
      action === "ban"
        ? c.var.can("user.ban", { id, role: "USER" })
        : c.var.can("user.setRole", { id })

    if (!allowed) {
      return c.fail("FORBIDDEN")
    }

    return next()
  })
