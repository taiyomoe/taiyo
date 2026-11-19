import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"

// Runs before the user is looked up, so a caller without the right learns nothing about the ID.
// `ban` and `moderateProfile` also depend on the target's role: checking them against a `USER`,
// the least protected role, refuses whoever cannot act on anyone. The handler checks again once
// the target is loaded.
export const authorizeUser = (action: "ban" | "moderateProfile" | "setRole") =>
  createMiddleware<{ Variables: { can: Permissions } }>(async (c, next) => {
    const id = c.req.param("id") ?? ""
    const allowed =
      action === "setRole"
        ? c.var.can("user.setRole", { id })
        : c.var.can(`user.${action}`, { id, role: "USER" })

    if (!allowed) {
      return c.fail("FORBIDDEN")
    }

    return next()
  })
