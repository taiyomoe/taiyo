import type { Chapter, Selectable } from "@taiyomoe/db"
import type { ChapterTarget, Permissions } from "@taiyomoe/permissions"
import { createMiddleware } from "hono/factory"
import { getChapterTarget } from "../utils/chapter-target"

export const authorizeChapter = (action: "update" | "delete") =>
  createMiddleware<{
    Variables: { can: Permissions; chapter: Selectable<Chapter>; chapterTarget: ChapterTarget }
  }>(async (c, next) => {
    const { can, chapter, db } = c.var
    const chapterTarget = await getChapterTarget(db, chapter)

    if (!can(`chapter.${action}`, chapterTarget)) {
      return c.fail("FORBIDDEN")
    }

    c.set("chapterTarget", chapterTarget)

    return next()
  })
