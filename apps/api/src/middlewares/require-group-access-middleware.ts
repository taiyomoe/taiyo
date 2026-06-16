import type { User } from "@taiyomoe/auth/server"
import type { Group, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

/**
 * Gates edit access to a single group under the additive ownership model.
 *
 * Allows the request when:
 *   - the user is ADMIN or MODERATOR, OR
 *   - the user is UPLOADER or UPLOADER_INTERN, OR
 *   - the user has any membership (OWNER or MEMBER) on the group exposed at
 *     `c.var.group`.
 *
 * Must run after `withAuth(...)` and `checkGroup()` so `c.var.user` and
 * `c.var.group` are populated. Fails with `FORBIDDEN` otherwise.
 */
export const requireGroupAccess = createMiddleware<{
  Variables: { user: User; group: Selectable<Group> }
}>(async (c, next) => {
  const { user, group, db } = c.var

  if (
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    user.role === "UPLOADER" ||
    user.role === "UPLOADER_INTERN"
  ) {
    return next()
  }

  const membership = await db
    .selectFrom("groupMemberships")
    .select("userId")
    .where("groupId", "=", group.id)
    .where("userId", "=", user.id)
    .executeTakeFirst()

  if (membership) {
    return next()
  }

  return c.fail("FORBIDDEN")
})
