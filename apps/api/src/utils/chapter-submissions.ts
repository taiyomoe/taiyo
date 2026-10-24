import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { publishAtIso } from "./chapter-release"
import { getMainCoverUrls, getMainTitles, withChapterDetails } from "./latest-chapters"

export const selectSubmissions = (db: Kysely<DB>) =>
  db
    .selectFrom("chapters")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .innerJoin("users", "users.id", "chapters.uploaderId")
    .where("chapters.deletedAt", "is", null)
    .where("medias.deletedAt", "is", null)

export const selectSubmissionColumns = (query: ReturnType<typeof selectSubmissions>) =>
  query.select([
    "chapters.id",
    "chapters.title",
    "chapters.number",
    "chapters.volume",
    "chapters.language",
    "chapters.contentRating",
    "chapters.createdAt",
    "chapters.mediaId",
    "chapters.status",
    "chapters.rejectionReason",
    "chapters.reviewedAt",
    "chapters.externalUrl",
    "chapters.isExternal",
    publishAtIso.as("publishAt"),
    sql<number>`coalesce(cardinality("chapters"."pages"), 0)`.as("pageCount"),
    "users.id as uploaderId",
    "users.username as uploaderUsername",
    "users.displayUsername as uploaderDisplayUsername",
    "users.image as uploaderImage",
  ])

export const withSubmissionDetails = async (
  db: Kysely<DB>,
  rows: Awaited<ReturnType<ReturnType<typeof selectSubmissionColumns>["execute"]>>,
) => {
  const mediaIds = [...new Set(rows.map((row) => row.mediaId))]
  const [chapters, coverUrls, titles] = await Promise.all([
    withChapterDetails(db, rows),
    getMainCoverUrls(db, mediaIds),
    getMainTitles(db, mediaIds),
  ])

  return chapters.map((chapter) => ({
    ...chapter,
    mediaTitle: titles.get(chapter.mediaId) ?? null,
    mediaCoverUrl: coverUrls.get(chapter.mediaId) ?? null,
  }))
}
