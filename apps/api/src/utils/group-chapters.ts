import type { DB, Kysely } from "@taiyomoe/db"

export const publishedChapters = (db: Kysely<DB>, groupId: string) =>
  db
    .selectFrom("chapters")
    .innerJoin("chapterGroups", "chapterGroups.chapterId", "chapters.id")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .where("chapterGroups.groupId", "=", groupId)
    .where("chapters.deletedAt", "is", null)
    .where("chapters.status", "=", "PUBLISHED")
    .where("medias.deletedAt", "is", null)
