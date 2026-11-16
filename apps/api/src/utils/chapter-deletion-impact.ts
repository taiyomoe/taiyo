import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"

const count = (description: string, example: number) => z.int().meta({ description, example })

export const chapterDeletionImpactSchema = z.object({
  pages: count("The number of pages of the chapters.", 24),
  readers: count("The number of users who read at least one of the chapters.", 4_310),
  bookmarks: count("The number of page bookmarks users put on the chapters.", 18),
  comments: count("The number of comments on the chapters.", 96),
  openPageReports: count("The number of open reports on the pages of the chapters.", 1),
  groups: count("The number of groups credited on the chapters.", 2),
})

/** Counts what deleting these chapters takes off the site. */
export const getChapterDeletionImpact = async (db: Kysely<DB>, chapterIds: readonly string[]) => {
  if (chapterIds.length === 0) {
    return { pages: 0, readers: 0, bookmarks: 0, comments: 0, openPageReports: 0, groups: 0 }
  }

  const counted = sql<number>`count(*)::int`.as("count")
  const [pages, readers, bookmarks, comments, openPageReports, groups] = await Promise.all([
    db
      .selectFrom("chapters")
      .select(sql<number>`coalesce(sum(cardinality("pages")), 0)::int`.as("count"))
      .where("id", "in", chapterIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("userHistories")
      .select(sql<number>`count(distinct "userId")::int`.as("count"))
      .where("chapterId", "in", chapterIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("pageBookmarks")
      .select(counted)
      .where("chapterId", "in", chapterIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("comments")
      .innerJoin("commentThreads", "commentThreads.id", "comments.threadId")
      .select(counted)
      .where("comments.deletedAt", "is", null)
      .where("commentThreads.chapterId", "in", chapterIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("pageReports")
      .select(counted)
      .where("chapterId", "in", chapterIds)
      .where("status", "=", "OPEN")
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("chapterGroups")
      .innerJoin("groups", "groups.id", "chapterGroups.groupId")
      .select(sql<number>`count(distinct "chapterGroups"."groupId")::int`.as("count"))
      .where("chapterGroups.chapterId", "in", chapterIds)
      .where("groups.deletedAt", "is", null)
      .executeTakeFirstOrThrow(),
  ])

  return {
    pages: pages.count,
    readers: readers.count,
    bookmarks: bookmarks.count,
    comments: comments.count,
    openPageReports: openPageReports.count,
    groups: groups.count,
  }
}
