import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"

const count = (description: string, example: number) => z.int().meta({ description, example })

export const mediaDeletionCountsSchema = z.object({
  publishedChapters: count("The number of published chapters that readers lose access to.", 214),
  unpublishedChapters: count(
    "The number of chapters waiting for review, scheduled or still uploading that never go live.",
    3,
  ),
  covers: count("The number of covers of the media.", 12),
  banners: count("The number of banners of the media.", 2),
  libraryEntries: count("The number of users with the media in their library.", 12_400),
  lists: count("The number of user lists that contain the media.", 87),
  readers: count("The number of users who read at least one chapter of the media.", 31_200),
  comments: count("The number of comments on the media and on its chapters.", 1_250),
  pendingSuggestions: count("The number of edit suggestions waiting for review.", 1),
  openPageReports: count("The number of open reports on the pages of its chapters.", 4),
})

/** Counts what deleting these medias takes off the site. */
export const getMediaDeletionImpact = async (db: Kysely<DB>, mediaIds: readonly string[]) => {
  if (mediaIds.length === 0) {
    return {
      publishedChapters: 0,
      unpublishedChapters: 0,
      covers: 0,
      banners: 0,
      libraryEntries: 0,
      lists: 0,
      readers: 0,
      comments: 0,
      pendingSuggestions: 0,
      openPageReports: 0,
      featured: 0,
    }
  }

  const chapterIds = db
    .selectFrom("chapters")
    .select("chapters.id")
    .where("chapters.mediaId", "in", mediaIds)
    .where("chapters.deletedAt", "is", null)
  const counted = sql<number>`count(*)::int`.as("count")
  const [
    chapters,
    covers,
    banners,
    libraryEntries,
    lists,
    readers,
    comments,
    pendingSuggestions,
    openPageReports,
    featured,
  ] = await Promise.all([
    db
      .selectFrom("chapters")
      .select([
        sql<number>`count(*) filter (where "status" = 'PUBLISHED')::int`.as("published"),
        sql<number>`count(*) filter (where "status" in ('UPLOADING', 'PENDING', 'SCHEDULED'))::int`.as(
          "unpublished",
        ),
      ])
      .where("mediaId", "in", mediaIds)
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("covers")
      .select(counted)
      .where("mediaId", "in", mediaIds)
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("banners")
      .select(counted)
      .where("mediaId", "in", mediaIds)
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("userLibraryEntries")
      .select(counted)
      .where("mediaId", "in", mediaIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("userListItems")
      .select(sql<number>`count(distinct "listId")::int`.as("count"))
      .where("mediaId", "in", mediaIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("userHistories")
      .select(sql<number>`count(distinct "userId")::int`.as("count"))
      .where("chapterId", "in", chapterIds)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("comments")
      .innerJoin("commentThreads", "commentThreads.id", "comments.threadId")
      .select(counted)
      .where("comments.deletedAt", "is", null)
      .where((eb) =>
        eb.or([
          eb("commentThreads.mediaId", "in", mediaIds),
          eb("commentThreads.chapterId", "in", chapterIds),
        ]),
      )
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("mediaSuggestions")
      .select(counted)
      .where("mediaId", "in", mediaIds)
      .where("status", "=", "PENDING")
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("pageReports")
      .select(counted)
      .where("chapterId", "in", chapterIds)
      .where("status", "=", "OPEN")
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("featuredMedias")
      .select(counted)
      .where("mediaId", "in", mediaIds)
      .executeTakeFirstOrThrow(),
  ])

  return {
    publishedChapters: chapters.published,
    unpublishedChapters: chapters.unpublished,
    covers: covers.count,
    banners: banners.count,
    libraryEntries: libraryEntries.count,
    lists: lists.count,
    readers: readers.count,
    comments: comments.count,
    pendingSuggestions: pendingSuggestions.count,
    openPageReports: openPageReports.count,
    featured: featured.count,
  }
}
