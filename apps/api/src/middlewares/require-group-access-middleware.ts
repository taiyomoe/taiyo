import type { User } from "@taiyomoe/auth/server"
import type { Group, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

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
