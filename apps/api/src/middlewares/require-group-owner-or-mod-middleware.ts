import type { User } from "@taiyomoe/auth/server"
import type { Group, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

/**
 * Allows the request only if:
 *   - the signed-in user is ADMIN or MODERATOR, OR
 *   - the user has an OWNER membership on the group exposed at `c.var.group`.
 *
 * Must run after `withAuth(...)` and `checkGroup()` so `c.var.user` and
 * `c.var.group` are populated.
 */
export const requireGroupOwnerOrMod = createMiddleware<{
  Variables: { user: User; group: Selectable<Group> }
}>(async (c, next) => {
  const { user, group, db } = c.var

  if (user.role === "ADMIN" || user.role === "MODERATOR") {
    return next()
  }

  const owner = await db
    .selectFrom("groupMemberships")
    .select("role")
    .where("groupId", "=", group.id)
    .where("userId", "=", user.id)
    .where("role", "=", "OWNER")
    .executeTakeFirst()

  if (owner) {
    return next()
  }

  return c.fail("FORBIDDEN")
})
