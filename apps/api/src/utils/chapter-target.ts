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

/** The permission targets of several chapters, read in one query. */
export const getChapterTargets = async (
  db: Kysely<DB>,
  chapters: ReadonlyArray<Pick<Selectable<Chapter>, "id" | "uploaderId" | "status">>,
) => {
  const rows =
    chapters.length === 0
      ? []
      : await db
          .selectFrom("chapterGroups")
          .innerJoin("groups", "groups.id", "chapterGroups.groupId")
          .select(["chapterGroups.chapterId", "chapterGroups.groupId"])
          .where(
            "chapterGroups.chapterId",
            "in",
            chapters.map((chapter) => chapter.id),
          )
          .where("groups.deletedAt", "is", null)
          .execute()

  return new Map(
    chapters.map((chapter) => [
      chapter.id,
      {
        uploaderId: chapter.uploaderId,
        status: chapter.status,
        groupIds: rows.filter((row) => row.chapterId === chapter.id).map((row) => row.groupId),
      } satisfies ChapterTarget,
    ]),
  )
}
