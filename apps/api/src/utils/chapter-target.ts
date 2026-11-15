import type { Chapter, DB, Kysely, Selectable } from "@taiyomoe/db"
import type { ChapterTarget } from "@taiyomoe/permissions"

export const getChapterTarget = async (
  db: Kysely<DB>,
  chapter: Pick<Selectable<Chapter>, "id" | "uploaderId" | "status">,
) => {
  const rows = await db
    .selectFrom("chapterGroups")
    .innerJoin("groups", "groups.id", "chapterGroups.groupId")
    .select("chapterGroups.groupId")
    .where("chapterGroups.chapterId", "=", chapter.id)
    .where("groups.deletedAt", "is", null)
    .execute()

  return {
    uploaderId: chapter.uploaderId,
    status: chapter.status,
    groupIds: rows.map((row) => row.groupId),
  } satisfies ChapterTarget
}
