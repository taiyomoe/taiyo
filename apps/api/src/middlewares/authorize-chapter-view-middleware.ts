import type { Chapter, Selectable } from "@taiyomoe/db"
import type { Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"
import { getChapterTarget } from "../utils/chapter-target"

export const authorizeChapterView = createMiddleware<{
  Variables: { can: Permissions; chapter: Selectable<Chapter> }
}>(async (c, next) => {
  const { can, chapter, db } = c.var

  if (chapter.status !== "PUBLISHED" && !can("chapter.view", await getChapterTarget(db, chapter))) {
    return c.fail("CHAPTER_NOT_FOUND")
  }

  return next()
})
