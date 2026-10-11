import type { User } from "@taiyomoe/auth/server"
import type { Chapter, Selectable } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"

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
