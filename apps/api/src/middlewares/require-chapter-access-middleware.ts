import type { User } from "@taiyomoe/auth/server"
import type { Chapter, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

/**
 * Gates edit access to a single chapter under the additive ownership model.
 *
 * Allows the request when:
 *   - the user is ADMIN or MODERATOR, OR
 *   - the user is UPLOADER or UPLOADER_INTERN, OR
 *   - the user has any membership (OWNER or MEMBER) on a group linked to the
 *     chapter exposed at `c.var.chapter`.
 *
 * Must run after `withAuth(...)` and `checkChapter()` so `c.var.user` and
 * `c.var.chapter` are populated. Fails with `FORBIDDEN` otherwise.
 */
export const requireChapterAccess = createMiddleware<{
  Variables: { user: User; chapter: Selectable<Chapter> }
}>(async (c, next) => {
  const { user, chapter, db } = c.var

  if (
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    user.role === "UPLOADER" ||
    user.role === "UPLOADER_INTERN"
  ) {
    return next()
  }

  const membership = await db
    .selectFrom("chapterGroups")
    .innerJoin("groupMemberships", "groupMemberships.groupId", "chapterGroups.groupId")
    .select("groupMemberships.groupId")
    .where("chapterGroups.chapterId", "=", chapter.id)
    .where("groupMemberships.userId", "=", user.id)
    .limit(1)
    .executeTakeFirst()

  if (membership) {
    return next()
  }

  return c.fail("FORBIDDEN")
})
