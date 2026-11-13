import { config } from "@taiyomoe/config"
import {
  COMMENT_TARGET_TYPES,
  type DB,
  type Kysely,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_NAMES,
  type NotificationCategory,
} from "@taiyomoe/db"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { type SqlBool, sql } from "kysely"
import { group } from "radashi"
import z from "zod"
import {
  bannedSql,
  liveCommentSql,
  THREAD_COLUMNS,
  timestampSql,
  visibleThreadTargetSql,
} from "./comments"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import { languageSchema, userSummarySchema } from "./schemas"

const EXCERPT_LENGTH = 200
const LATEST_ACTORS = 3
const graphemes = new Intl.Segmenter()
const excerptOf = (content: string | null) =>
  Array.from(graphemes.segment(getCommentText(content ?? "")), ({ segment }) => segment)
    .slice(0, EXCERPT_LENGTH)
    .join("")
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (match) => `\\${match}`)
const notificationBaseSchema = z.object({
  id: z.uuid(),
  lastEventAt: z.iso.datetime().meta({
    description: "When the latest event behind the notification happened.",
  }),
  readAt: z.iso.datetime().nullable().meta({ description: "When you read it, or null." }),
})
const commentTargetSchema = z
  .object({
    type: z.enum(COMMENT_TARGET_TYPES),
    id: z.uuid(),
    username: z.string().nullable().meta({
      description: "The profile owner's username when the thread is on a profile.",
    }),
    title: z.string().nullable().meta({
      description:
        "What the thread is about: the media's main title, the group's name or the profile owner's display name.",
    }),
    chapterNumber: z.number().nullable().meta({
      description: "The chapter's number when the thread is on a chapter.",
    }),
  })
  .meta({ description: "What the comment thread is about." })
const actorsSchema = z.object({
  count: z.int().positive().meta({
    description: "How many people are behind the notification, leaving out those who took it back.",
  }),
  latest: userSummarySchema
    .array()
    .meta({ description: `The ${LATEST_ACTORS} most recent of them, newest first.` }),
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
      rootId: z.uuid().meta({ description: "The ID of the comment that opens the thread." }),
      excerpt: z
        .string()
        .meta({ description: "The start of the reply's text, without its images." }),
      viewerVoted: z.boolean().meta({ description: "Whether you upvoted the reply." }),
      target: commentTargetSchema,
      author: userSummarySchema,
    }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_LIKE"),
    comment: z.object({
      id: z.uuid().meta({ description: "The ID of your comment." }),
      excerpt: z
        .string()
        .meta({ description: "The start of your comment's text, without its images." }),
      target: commentTargetSchema,
    }),
    upvoteCount: z.int().positive().meta({
      description:
        "How many people upvoted your comment since the notification opened, leaving out those who took it back. Upvotes stay anonymous.",
    }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("FOLLOW"),
    actors: actorsSchema.meta({ description: "Who started following you." }),
  }),
])

export const notificationFiltersSchema = z.object({
  category: z.enum(NOTIFICATION_CATEGORY_NAMES).optional().meta({
    description:
      "Only this kind: new chapters, replies to your comments, or activity (upvotes and follows).",
    example: "chapters",
  }),
  unread: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .meta({ description: "Only the notifications you haven't read.", example: "true" }),
  q: z.string().trim().max(100).optional().meta({
    description: "Matches titles, chapter titles, groups, repliers, followers and comment text.",
    example: "solo",
  }),
})

export type NotificationFilters = z.infer<typeof notificationFiltersSchema>

/** People behind a FOLLOW or COMMENT_LIKE notification (aliases n, na, au) who still follow or upvote. */
const liveActorSql = sql<SqlBool>`(
  not ${bannedSql("au")}
  and case "n"."type"
    when 'FOLLOW' then exists (
      select 1 from "userFollows" as "uf"
      where "uf"."followerId" = "na"."actorId" and "uf"."followingId" = "n"."userId"
    )
    when 'COMMENT_LIKE' then exists (
      select 1 from "commentVotes" as "cv"
      where "cv"."commentId" = "n"."commentId" and "cv"."userId" = "na"."actorId"
    )
    else false
  end
)`
const hasLiveActorSql = sql<SqlBool>`exists (
  select 1 from "notificationActors" as "na"
  inner join "users" as "au" on "au"."id" = "na"."actorId"
  where "na"."notificationId" = "n"."id" and ${liveActorSql}
)`
const searchSql = (search: string) => {
  const pattern = `%${escapeLike(search)}%`

  return sql<SqlBool>`(
    exists (
      select 1 from "titles" as "st"
      where "st"."deletedAt" is null
        and "st"."title" ilike ${pattern}
        and "st"."mediaId" in (
          "ch"."mediaId",
          "t"."mediaId",
          (select "tc"."mediaId" from "chapters" as "tc" where "tc"."id" = "t"."chapterId")
        )
    )
    or "ch"."title" ilike ${pattern}
    or exists (
      select 1 from "chapterGroups" as "scg"
      inner join "groups" as "sg" on "sg"."id" = "scg"."groupId"
      where "scg"."chapterId" = "ch"."id" and "sg"."name" ilike ${pattern}
    )
    or exists (select 1 from "groups" as "tg" where "tg"."id" = "t"."groupId" and "tg"."name" ilike ${pattern})
    or ("n"."type" = 'COMMENT_REPLY' and ("u"."username" ilike ${pattern} or "u"."displayUsername" ilike ${pattern}))
    or "c"."content" ilike ${pattern}
    or ("n"."type" = 'FOLLOW' and exists (
      select 1 from "notificationActors" as "sa"
      inner join "users" as "su" on "su"."id" = "sa"."actorId"
      where "sa"."notificationId" = "n"."id"
        and ("su"."username" ilike ${pattern} or "su"."displayUsername" ilike ${pattern})
    ))
  )`
}

export const selectVisibleNotifications = (
  db: Kysely<DB>,
  userId: string,
  { category, unread = false, q = "" }: NotificationFilters = {},
) =>
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
        eb.and([
          eb("n.type", "=", "COMMENT_LIKE"),
          liveCommentSql("c", "u"),
          visibleThreadTargetSql("t"),
          hasLiveActorSql,
        ]),
        eb.and([eb("n.type", "=", "FOLLOW"), hasLiveActorSql]),
      ]),
    )
    .$call((qb) =>
      category === undefined
        ? qb
        : qb.where("n.type", "in", [...NOTIFICATION_CATEGORIES[category]]),
    )
    .$if(unread, (qb) => qb.where("n.readAt", "is", null))
    .$if(q !== "", (qb) => qb.where(searchSql(q)))

export const countNotifications = async (db: Kysely<DB>, userId: string) => {
  const unreadOf = (category: NotificationCategory) =>
    sql<string>`count(*) filter (where "n"."readAt" is null and "n"."type" in (${sql.join(
      NOTIFICATION_CATEGORIES[category].map((type) => sql.lit(type)),
    )}))`
  const row = await selectVisibleNotifications(db, userId)
    .select([
      sql<string>`count(*)`.as("total"),
      sql<string>`count(*) filter (where "n"."readAt" is null)`.as("unread"),
      unreadOf("chapters").as("chapters"),
      unreadOf("replies").as("replies"),
      unreadOf("activity").as("activity"),
    ])
    .executeTakeFirstOrThrow()

  return {
    total: Number(row.total),
    unread: Number(row.unread),
    categories: {
      chapters: Number(row.chapters),
      replies: Number(row.replies),
      activity: Number(row.activity),
    },
  }
}

const listActors = async (db: Kysely<DB>, notificationIds: string[]) => {
  if (notificationIds.length === 0) {
    return new Map<string, z.infer<typeof actorsSchema>>()
  }

  const { rows } = await sql<{
    notificationId: string
    id: string
    username: string
    displayUsername: string
    image: string | null
    nameEffect: string | null
    avatarBorder: string | null
    count: string
  }>`
    select * from (
      select
        "na"."notificationId",
        "au"."id",
        "au"."username",
        "au"."displayUsername",
        "au"."image",
        "au"."nameEffect",
        "au"."avatarBorder",
        row_number() over (partition by "na"."notificationId" order by "na"."createdAt" desc, "au"."id") as "rank",
        count(*) over (partition by "na"."notificationId") as "count"
      from "notifications" as "n"
      inner join "notificationActors" as "na" on "na"."notificationId" = "n"."id"
      inner join "users" as "au" on "au"."id" = "na"."actorId"
      where "n"."id" in (${sql.join(notificationIds)}) and ${liveActorSql}
    ) as "ranked"
    where "rank" <= ${LATEST_ACTORS}
    order by "rank"
  `.execute(db)

  return new Map(
    Object.entries(group(rows, (row) => row.notificationId)).map(
      ([notificationId, actors = []]) => [
        notificationId,
        {
          count: Number(actors[0]?.count ?? 0),
          latest: actors.map(
            ({ id, username, displayUsername, image, nameEffect, avatarBorder }) => ({
              id,
              username,
              displayUsername,
              image,
              nameEffect,
              avatarBorder,
            }),
          ),
        },
      ],
    ),
  )
}
const resolveTargets = async (
  db: Kysely<DB>,
  threads: Array<{ chapterId: string | null; groupId: string | null }>,
) => {
  const chapterIds = [...new Set(threads.flatMap(({ chapterId }) => chapterId ?? []))]
  const groupIds = [...new Set(threads.flatMap(({ groupId }) => groupId ?? []))]
  const [chapters, groups] = await Promise.all([
    chapterIds.length === 0
      ? []
      : db
          .selectFrom("chapters")
          .where("id", "in", chapterIds)
          .select(["id", "mediaId", "number"])
          .execute(),
    groupIds.length === 0
      ? []
      : db.selectFrom("groups").where("id", "in", groupIds).select(["id", "name"]).execute(),
  ])

  return {
    chapters: new Map(chapters.map((chapter) => [chapter.id, chapter])),
    groupNames: new Map(groups.map((item) => [item.id, item.name])),
  }
}

export const listNotifications = async (
  db: Kysely<DB>,
  userId: string,
  { page, perPage, ...filters }: { page: number; perPage: number } & NotificationFilters,
) => {
  const rows = await selectVisibleNotifications(db, userId, filters)
    .leftJoin("users as pu", "pu.id", "t.profileId")
    .select([
      "n.id",
      "n.type",
      timestampSql("n.lastEventAt").as("lastEventAt"),
      timestampSql("n.readAt").$castTo<string | null>().as("readAt"),
      "ch.id as chapterId",
      "ch.title as chapterTitle",
      "ch.number as chapterNumber",
      "ch.volume as chapterVolume",
      "ch.language as chapterLanguage",
      "ch.mediaId",
      "c.id as commentId",
      "c.parentId as commentParentId",
      "c.content as commentContent",
      sql<boolean>`exists (select 1 from "commentVotes" as "vv" where "vv"."commentId" = "c"."id" and "vv"."userId" = ${userId})`.as(
        "viewerVoted",
      ),
      "t.mediaId as threadMediaId",
      "t.chapterId as threadChapterId",
      "t.groupId as threadGroupId",
      "t.profileId as threadProfileId",
      "pu.username as threadProfileUsername",
      "pu.displayUsername as threadProfileName",
      "u.id as authorId",
      "u.username as authorUsername",
      "u.displayUsername as authorDisplayUsername",
      "u.image as authorImage",
      "u.nameEffect as authorNameEffect",
      "u.avatarBorder as authorAvatarBorder",
    ])
    .orderBy("n.lastEventAt", "desc")
    .orderBy("n.id", "desc")
    .limit(perPage)
    .offset((page - 1) * perPage)
    .execute()
  const { chapters, groupNames } = await resolveTargets(
    db,
    rows.map((row) => ({ chapterId: row.threadChapterId, groupId: row.threadGroupId })),
  )
  const chapterIds = rows.flatMap((row) => row.chapterId ?? [])
  const mediaIds = [
    ...new Set(
      rows
        .flatMap((row) => [
          row.mediaId,
          row.threadMediaId,
          chapters.get(row.threadChapterId ?? "")?.mediaId,
        ])
        .flatMap((id) => id ?? []),
    ),
  ]
  const [titles, covers, credits, actors] = await Promise.all([
    getMainTitles(db, mediaIds),
    getMainCoverUrls(
      db,
      rows.flatMap((row) => row.mediaId ?? []),
    ),
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
    listActors(
      db,
      rows.flatMap((row) => (row.type === "FOLLOW" || row.type === "COMMENT_LIKE" ? row.id : [])),
    ),
  ])
  const groupsByChapter = group(credits, (credit) => credit.chapterId)
  const targetOf = (row: (typeof rows)[number]) => {
    const threadIds = {
      mediaId: row.threadMediaId,
      chapterId: row.threadChapterId,
      groupId: row.threadGroupId,
      profileId: row.threadProfileId,
    }
    const type = COMMENT_TARGET_TYPES.find((item) => threadIds[THREAD_COLUMNS[item]] !== null)
    const id = type === undefined ? null : threadIds[THREAD_COLUMNS[type]]

    if (type === undefined || id === null) {
      return null
    }

    const chapter = chapters.get(row.threadChapterId ?? "")
    const title = {
      MEDIA: titles.get(row.threadMediaId ?? ""),
      CHAPTER: titles.get(chapter?.mediaId ?? ""),
      GROUP: groupNames.get(row.threadGroupId ?? ""),
      USER: row.threadProfileName,
    }[type]

    return {
      type,
      id,
      username: row.threadProfileUsername,
      title: title ?? null,
      chapterNumber: chapter?.number ?? null,
    }
  }

  return rows
    .map((row) => {
      const base = { id: row.id, lastEventAt: row.lastEventAt, readAt: row.readAt }

      if (row.type === "CHAPTER_PUBLISHED") {
        return row.chapterId === null || row.mediaId === null
          ? null
          : {
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
                groups: (groupsByChapter[row.chapterId] ?? []).map(({ id, name }) => ({
                  id,
                  name,
                })),
              },
            }
      }

      if (row.type === "FOLLOW") {
        const followers = actors.get(row.id)

        return followers === undefined ? null : { ...base, type: row.type, actors: followers }
      }

      const target = targetOf(row)

      if (row.commentId === null || target === null) {
        return null
      }

      if (row.type === "COMMENT_LIKE") {
        const likers = actors.get(row.id)

        return likers === undefined
          ? null
          : {
              ...base,
              type: row.type,
              comment: { id: row.commentId, excerpt: excerptOf(row.commentContent), target },
              upvoteCount: likers.count,
            }
      }

      if (row.authorId === null) {
        return null
      }

      return {
        ...base,
        type: row.type,
        comment: {
          id: row.commentId,
          rootId: row.commentParentId ?? row.commentId,
          excerpt: excerptOf(row.commentContent),
          viewerVoted: row.viewerVoted,
          target,
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

const ACTIVITY_SETTINGS = { FOLLOW: "notifyFollows", COMMENT_LIKE: "notifyLikes" } as const

/**
 * Adds `actorId` to the recipient's unread FOLLOW or COMMENT_LIKE notification, or opens a new
 * one once the previous is read. Each person counts once per target, so following again or
 * upvoting again never notifies twice. Resolves whether the recipient's notifications changed.
 * Must run in a transaction: it serialises concurrent events for the same target.
 */
export const recordActivity = async (
  db: Kysely<DB>,
  {
    type,
    recipientId,
    actorId,
    commentId = null,
  }: {
    type: keyof typeof ACTIVITY_SETTINGS
    recipientId: string
    actorId: string
    commentId?: string | null
  },
) => {
  const setting = ACTIVITY_SETTINGS[type]
  const recipient = await db
    .selectFrom("users")
    .select(
      sql<boolean>`coalesce(("settings" ->> ${setting})::boolean, ${config.settings[setting]})`.as(
        "enabled",
      ),
    )
    .where("id", "=", recipientId)
    .executeTakeFirst()

  if (recipient?.enabled !== true || recipientId === actorId) {
    return false
  }

  await sql`select pg_advisory_xact_lock(hashtextextended(${`notification:${type}:${recipientId}:${commentId ?? ""}`}, 0))`.execute(
    db,
  )

  const sameTarget = db
    .selectFrom("notifications as n")
    .where("n.userId", "=", recipientId)
    .where("n.type", "=", type)
    .where((eb) =>
      commentId === null ? eb("n.commentId", "is", null) : eb("n.commentId", "=", commentId),
    )
  const counted = await sameTarget
    .innerJoin("notificationActors as na", "na.notificationId", "n.id")
    .where("na.actorId", "=", actorId)
    .select("n.id")
    .executeTakeFirst()

  if (counted !== undefined) {
    return false
  }

  const open = await sameTarget
    .where("n.readAt", "is", null)
    .select("n.id")
    .orderBy("n.lastEventAt", "desc")
    .limit(1)
    .executeTakeFirst()
  const { id } =
    open === undefined
      ? await db
          .insertInto("notifications")
          .values({ userId: recipientId, type, commentId })
          .returning("id")
          .executeTakeFirstOrThrow()
      : await db
          .updateTable("notifications")
          .set({ lastEventAt: sql<Date>`CURRENT_TIMESTAMP` })
          .where("id", "=", open.id)
          .returning("id")
          .executeTakeFirstOrThrow()

  await db.insertInto("notificationActors").values({ notificationId: id, actorId }).execute()

  return true
}
