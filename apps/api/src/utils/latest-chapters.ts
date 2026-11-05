import { type ContentRating, type DB, type Kysely, sql } from "@taiyomoe/db"
import { getCoverUrl } from "@taiyomoe/s3"
import { group } from "radashi"

const effectiveContentRating = sql<ContentRating>`greatest(${sql.ref("medias.contentRating")}, ${sql.ref("chapters.contentRating")})`

type ChapterFilters = {
  contentRatings: ContentRating[]
  mediaId?: string | undefined
  groupId?: string | undefined
  uploaderId?: string | undefined
  search?: string | undefined
  status?: "PUBLISHED" | "SCHEDULED"
}

export const selectVisibleChapters = (
  db: Kysely<DB>,
  { contentRatings, mediaId, groupId, uploaderId, search, status = "PUBLISHED" }: ChapterFilters,
) =>
  db
    .selectFrom("chapters")
    .innerJoin("medias", "medias.id", "chapters.mediaId")
    .where("chapters.deletedAt", "is", null)
    .where("chapters.status", "=", status)
    .where("medias.deletedAt", "is", null)
    .where(effectiveContentRating, "in", contentRatings)
    .where((eb) => (mediaId === undefined ? eb.and([]) : eb("chapters.mediaId", "=", mediaId)))
    .where((eb) =>
      uploaderId === undefined ? eb.and([]) : eb("chapters.uploaderId", "=", uploaderId),
    )
    .where((eb) =>
      groupId === undefined
        ? eb.and([])
        : eb.exists(
            eb
              .selectFrom("chapterGroups")
              .select("chapterGroups.groupId")
              .whereRef("chapterGroups.chapterId", "=", "chapters.id")
              .where("chapterGroups.groupId", "=", groupId),
          ),
    )
    .where((eb) => {
      if (search === undefined) {
        return eb.and([])
      }

      const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`
      const number = /^(?:ch(?:apter)?\.?\s*)?(\d+(?:\.\d+)?)$/i.exec(search)?.[1]

      return eb.or([
        eb("chapters.title", "ilike", pattern),
        ...(number === undefined ? [] : [eb("chapters.number", "=", Number(number))]),
        eb.exists(
          eb
            .selectFrom("titles")
            .select("titles.mediaId")
            .whereRef("titles.mediaId", "=", "chapters.mediaId")
            .where("titles.deletedAt", "is", null)
            .where("titles.title", "ilike", pattern),
        ),
      ])
    })

export const selectLatestChapters = (db: Kysely<DB>, filters: ChapterFilters) =>
  selectVisibleChapters(db, filters)
    .innerJoin("users", "users.id", "chapters.uploaderId")
    .select([
      "chapters.id",
      "chapters.title",
      "chapters.number",
      "chapters.volume",
      "chapters.language",
      "chapters.contentRating",
      "chapters.createdAt",
      "chapters.mediaId",
      "chapters.externalUrl",
      "chapters.isExternal",
      "users.id as uploaderId",
      "users.username as uploaderUsername",
      "users.displayUsername as uploaderDisplayUsername",
      "users.image as uploaderImage",
      "users.nameEffect as uploaderNameEffect",
      "users.avatarBorder as uploaderAvatarBorder",
    ])

type LatestChapterRow = {
  id: string
  uploaderId: string
  uploaderUsername: string
  uploaderDisplayUsername: string
  uploaderImage: string | null
  uploaderNameEffect: string | null
  uploaderAvatarBorder: string | null
}

export const withChapterDetails = async <T extends LatestChapterRow>(db: Kysely<DB>, rows: T[]) => {
  const credits =
    rows.length === 0
      ? []
      : await db
          .selectFrom("chapterGroups")
          .innerJoin("groups", "groups.id", "chapterGroups.groupId")
          .where(
            "chapterGroups.chapterId",
            "in",
            rows.map((row) => row.id),
          )
          .where("groups.deletedAt", "is", null)
          .select(["chapterGroups.chapterId", "groups.id", "groups.name"])
          .orderBy("groups.name", "asc")
          .execute()
  const groupsByChapter = group(credits, (credit) => credit.chapterId)

  return rows.map(
    ({
      uploaderId,
      uploaderUsername,
      uploaderDisplayUsername,
      uploaderImage,
      uploaderNameEffect,
      uploaderAvatarBorder,
      ...row
    }) => ({
      ...row,
      groups: (groupsByChapter[row.id] ?? []).map(({ id, name }) => ({ id, name })),
      uploader: {
        id: uploaderId,
        username: uploaderUsername,
        displayUsername: uploaderDisplayUsername,
        image: uploaderImage,
        nameEffect: uploaderNameEffect,
        avatarBorder: uploaderAvatarBorder,
      },
    }),
  )
}

export const getMainCoverUrls = async (db: Kysely<DB>, mediaIds: string[]) => {
  const covers =
    mediaIds.length === 0
      ? []
      : await db
          .selectFrom("covers")
          .where("mediaId", "in", mediaIds)
          .where("isMainCover", "=", true)
          .where("deletedAt", "is", null)
          .select(["mediaId", "id", "extension"])
          .execute()

  return new Map(
    covers.map((cover) => [cover.mediaId, getCoverUrl(cover.mediaId, cover.id, cover.extension)]),
  )
}

export const getMainTitles = async (db: Kysely<DB>, mediaIds: string[]) => {
  const titles =
    mediaIds.length === 0
      ? []
      : await db
          .selectFrom("titles")
          .where("mediaId", "in", mediaIds)
          .where("isMainTitle", "=", true)
          .where("deletedAt", "is", null)
          .select(["mediaId", "title"])
          .execute()

  return new Map(titles.map((title) => [title.mediaId, title.title]))
}
