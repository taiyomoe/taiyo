import { COMMENT_TARGET_TYPES, type DB, type Kysely } from "@taiyomoe/db"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { group } from "radashi"
import z from "zod"
import { liveCommentSql, THREAD_COLUMNS, visibleThreadTargetSql } from "./comments"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import { languageSchema, userSummarySchema } from "./schemas"

const EXCERPT_LENGTH = 200
const graphemes = new Intl.Segmenter()
const notificationBaseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime().meta({ description: "When the notification was created." }),
  readAt: z.iso.datetime().nullable().meta({ description: "When you read it, or null." }),
})

export const notificationSchema = z.discriminatedUnion("type", [
  notificationBaseSchema.extend({
    type: z.literal("CHAPTER_PUBLISHED"),
    chapter: z.object({
      id: z.uuid(),
      title: z.string().nullable(),
      number: z.number(),
      volume: z.string().nullable(),
      language: languageSchema("The language of the chapter."),
      mediaId: z.uuid(),
      mediaTitle: z.string().nullable().meta({ description: "The main title of the media." }),
      mediaCoverUrl: z.url().nullable().meta({ description: "The main cover of the media." }),
      groups: z
        .object({ id: z.uuid(), name: z.string() })
        .array()
        .meta({ description: "The groups credited on the chapter." }),
    }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_REPLY"),
    comment: z.object({
      id: z.uuid().meta({ description: "The ID of the reply." }),
      excerpt: z
        .string()
        .meta({ description: "The start of the reply's text, without its images." }),
      target: z
        .object({ type: z.enum(COMMENT_TARGET_TYPES), id: z.uuid() })
        .meta({ description: "What the comment thread is about." }),
      author: userSummarySchema,
    }),
  }),
])

export const selectVisibleNotifications = (db: Kysely<DB>, userId: string) =>
  db
    .selectFrom("notifications as n")
    .leftJoin("chapters as ch", "ch.id", "n.chapterId")
    .leftJoin("medias as md", "md.id", "ch.mediaId")
    .leftJoin("comments as c", "c.id", "n.commentId")
    .leftJoin("users as u", "u.id", "c.authorId")
    .leftJoin("commentThreads as t", "t.id", "c.threadId")
    .where("n.userId", "=", userId)
    .where((eb) =>
      eb.or([
        eb.and([
          eb("n.type", "=", "CHAPTER_PUBLISHED"),
          eb("ch.status", "=", "PUBLISHED"),
          eb("ch.deletedAt", "is", null),
          eb("md.deletedAt", "is", null),
        ]),
        eb.and([
          eb("n.type", "=", "COMMENT_REPLY"),
          liveCommentSql("c", "u"),
          visibleThreadTargetSql("t"),
        ]),
      ]),
    )

export const listNotifications = async (
  db: Kysely<DB>,
  userId: string,
  { page, perPage }: { page: number; perPage: number },
) => {
  const rows = await selectVisibleNotifications(db, userId)
    .select([
      "n.id",
      "n.type",
      "n.createdAt",
      "n.readAt",
      "ch.id as chapterId",
      "ch.title as chapterTitle",
      "ch.number as chapterNumber",
      "ch.volume as chapterVolume",
      "ch.language as chapterLanguage",
      "ch.mediaId",
      "c.id as commentId",
      "c.content as commentContent",
      "t.mediaId as threadMediaId",
      "t.chapterId as threadChapterId",
      "t.groupId as threadGroupId",
      "t.profileId as threadProfileId",
      "u.id as authorId",
      "u.username as authorUsername",
      "u.displayUsername as authorDisplayUsername",
      "u.image as authorImage",
      "u.nameEffect as authorNameEffect",
      "u.avatarBorder as authorAvatarBorder",
    ])
    .orderBy("n.createdAt", "desc")
    .orderBy("n.id", "desc")
    .limit(perPage)
    .offset((page - 1) * perPage)
    .execute()
  const chapterIds = rows.flatMap((row) => (row.chapterId === null ? [] : [row.chapterId]))
  const mediaIds = [...new Set(rows.flatMap((row) => (row.mediaId === null ? [] : [row.mediaId])))]
  const [titles, covers, credits] = await Promise.all([
    getMainTitles(db, mediaIds),
    getMainCoverUrls(db, mediaIds),
    chapterIds.length === 0
      ? []
      : db
          .selectFrom("chapterGroups")
          .innerJoin("groups", "groups.id", "chapterGroups.groupId")
          .where("chapterGroups.chapterId", "in", chapterIds)
          .where("groups.deletedAt", "is", null)
          .select(["chapterGroups.chapterId", "groups.id", "groups.name"])
          .orderBy("groups.name", "asc")
          .execute(),
  ])
  const groupsByChapter = group(credits, (credit) => credit.chapterId)

  return rows
    .map((row) => {
      const base = { id: row.id, createdAt: row.createdAt, readAt: row.readAt }

      if (row.type === "CHAPTER_PUBLISHED" && row.chapterId !== null && row.mediaId !== null) {
        return {
          ...base,
          type: row.type,
          chapter: {
            id: row.chapterId,
            title: row.chapterTitle,
            number: row.chapterNumber ?? 0,
            volume: row.chapterVolume,
            language: row.chapterLanguage ?? "en",
            mediaId: row.mediaId,
            mediaTitle: titles.get(row.mediaId) ?? null,
            mediaCoverUrl: covers.get(row.mediaId) ?? null,
            groups: (groupsByChapter[row.chapterId] ?? []).map(({ id, name }) => ({ id, name })),
          },
        }
      }

      const threadIds = {
        mediaId: row.threadMediaId,
        chapterId: row.threadChapterId,
        groupId: row.threadGroupId,
        profileId: row.threadProfileId,
      }
      const targetType = COMMENT_TARGET_TYPES.find(
        (type) => threadIds[THREAD_COLUMNS[type]] !== null,
      )
      const targetId = targetType === undefined ? null : threadIds[THREAD_COLUMNS[targetType]]

      if (
        row.commentId === null ||
        row.authorId === null ||
        targetType === undefined ||
        targetId === null
      ) {
        return null
      }

      return {
        ...base,
        type: "COMMENT_REPLY" as const,
        comment: {
          id: row.commentId,
          excerpt: Array.from(
            graphemes.segment(getCommentText(row.commentContent ?? "")),
            ({ segment }) => segment,
          )
            .slice(0, EXCERPT_LENGTH)
            .join(""),
          target: { type: targetType, id: targetId },
          author: {
            id: row.authorId,
            username: row.authorUsername ?? "",
            displayUsername: row.authorDisplayUsername ?? "",
            image: row.authorImage,
            nameEffect: row.authorNameEffect,
            avatarBorder: row.authorAvatarBorder,
          },
        },
      }
    })
    .filter((notification) => notification !== null)
}
