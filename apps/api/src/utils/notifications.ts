import type { NotificationEvents } from "@taiyomoe/cache/notification-events"
import { config } from "@taiyomoe/config"
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_KEYS,
  ACHIEVEMENTS,
  COMMENT_TARGET_TYPES,
  COSMETIC_RARITIES,
  isAchievementKey,
  type DB,
  type Kysely,
  LIST_MODERATION_ACTIONS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_NAMES,
  type NotificationCategory,
  type NotificationPayload,
  PROFILE_MODERATION_FIELDS,
  type SqlBool,
  sql,
} from "@taiyomoe/db"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { group } from "radashi"
import z from "zod"
import {
  bannedSql,
  liveCommentSql,
  THREAD_COLUMNS,
  timestampSql,
  visibleThreadTargetSql,
} from "./comments"
import { escapeLike } from "./escape-like"
import { getMainCoverUrls, getMainTitles } from "./latest-chapters"
import { storedLanguageSchema, userSummarySchema } from "./schemas"

const EXCERPT_LENGTH = 200
const LATEST_ACTORS = 3
const graphemes = new Intl.Segmenter()
const excerptOf = (content: string | null) =>
  Array.from(graphemes.segment(getCommentText(content ?? "")), ({ segment }) => segment)
    .slice(0, EXCERPT_LENGTH)
    .join("")
const notificationBaseSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the notification." }),
  lastEventAt: z.iso.datetime().meta({
    description: "When the latest event behind the notification happened.",
  }),
  readAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When you read the notification, if any." }),
})
const commentTargetSchema = z
  .object({
    type: z
      .enum(COMMENT_TARGET_TYPES)
      .meta({ description: "The kind of page the thread is on.", example: "CHAPTER" }),
    id: z.uuid().meta({ description: "The ID of the media, chapter, group or user." }),
    username: z.string().nullable().meta({
      description: "The username of the profile owner when the thread is on a profile, if any.",
      example: "kaito",
    }),
    title: z.string().nullable().meta({
      description:
        "What the thread is about: the main title of the media, the name of the group or the display name of the profile owner, if any.",
      example: "Solo Leveling",
    }),
    chapterNumber: z.number().nullable().meta({
      description: "The number of the chapter when the thread is on a chapter, if any.",
      example: 112,
    }),
  })
  .meta({ description: "What the comment thread is about." })
const deletedSchema = (subject: string) =>
  z.boolean().meta({ description: `Whether the ${subject} was deleted since.` })
const reportBaseSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  outcome: z.enum(["RESOLVED", "DISMISSED"]).meta({
    description:
      "How the moderation team closed the report: `RESOLVED` when they acted on it, `DISMISSED` when they found nothing wrong.",
    example: "RESOLVED",
  }),
})
const reportSchema = z
  .discriminatedUnion("kind", [
    reportBaseSchema.extend({
      kind: z.literal("PAGE").meta({ description: "What you reported: a page of a chapter." }),
      chapter: z
        .object({
          id: z.uuid().meta({ description: "The ID of the chapter." }),
          number: z.number().meta({ description: "The number of the chapter.", example: 112 }),
          title: z
            .string()
            .nullable()
            .meta({ description: "The title of the chapter, if any.", example: "Arise" }),
          mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
          mediaTitle: z.string().nullable().meta({
            description: "The main title of the media, if any.",
            example: "Solo Leveling",
          }),
          deleted: deletedSchema("chapter or its media"),
        })
        .nullable()
        .meta({ description: "The chapter of the reported page, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("COMMENT").meta({ description: "What you reported: a comment." }),
      comment: z
        .object({
          id: z.uuid().meta({ description: "The ID of the comment." }),
          excerpt: z.string().nullable().meta({
            description:
              "The start of the comment's text, without its images, if the comment is still up.",
          }),
          deleted: z.boolean().meta({ description: "Whether the comment was removed since." }),
          target: commentTargetSchema.nullable(),
        })
        .nullable()
        .meta({ description: "The reported comment, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("GROUP").meta({ description: "What you reported: a group." }),
      group: z
        .object({
          id: z.uuid().meta({ description: "The ID of the group." }),
          name: z.string().meta({ description: "The name of the group.", example: "Sunray Scans" }),
          deleted: deletedSchema("group"),
        })
        .nullable()
        .meta({ description: "The reported group, if it still exists." }),
    }),
    reportBaseSchema.extend({
      kind: z.literal("USER").meta({ description: "What you reported: a user's profile." }),
      user: z
        .object({
          id: z.uuid().meta({ description: "The ID of the user." }),
          username: z.string().meta({ description: "The username of the user.", example: "kaito" }),
          displayUsername: z
            .string()
            .meta({ description: "The display name of the user.", example: "Kaito" }),
        })
        .nullable()
        .meta({ description: "The reported user, if they still exist." }),
    }),
  ])
  .meta({ description: "Your report and what it was about." })
const actorsSchema = z.object({
  count: z.int().positive().meta({
    description:
      "The number of people behind the notification, leaving out those who took it back.",
  }),
  latest: userSummarySchema
    .array()
    .meta({ description: `The ${LATEST_ACTORS} most recent of them, newest first.` }),
})

export const notificationSchema = z.discriminatedUnion("type", [
  notificationBaseSchema.extend({
    type: z.literal("CHAPTER_PUBLISHED").meta({ description: "The kind of notification." }),
    chapter: z
      .object({
        id: z.uuid().meta({ description: "The ID of the chapter." }),
        title: z
          .string()
          .nullable()
          .meta({ description: "The title of the chapter, if any.", example: "Arise" }),
        number: z.number().meta({ description: "The number of the chapter.", example: 112 }),
        volume: z
          .string()
          .nullable()
          .meta({ description: "The volume of the chapter, if any.", example: "12" }),
        language: storedLanguageSchema("The language of the chapter."),
        mediaId: z.uuid().meta({ description: "The ID of the media the chapter belongs to." }),
        mediaTitle: z
          .string()
          .nullable()
          .meta({ description: "The main title of the media, if any.", example: "Solo Leveling" }),
        mediaCoverUrl: z
          .url()
          .nullable()
          .meta({ description: "The URL of the main cover of the media, if any." }),
        groups: z
          .object({
            id: z.uuid().meta({ description: "The ID of the group." }),
            name: z
              .string()
              .meta({ description: "The name of the group.", example: "Sunray Scans" }),
          })
          .array()
          .meta({ description: "The groups credited on the chapter, alphabetically by name." }),
      })
      .meta({ description: "The chapter that came out." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_REPLY").meta({ description: "The kind of notification." }),
    comment: z
      .object({
        id: z.uuid().meta({ description: "The ID of the reply." }),
        rootId: z.uuid().meta({ description: "The ID of the comment that opens the thread." }),
        excerpt: z
          .string()
          .meta({ description: "The start of the reply's text, without its images." }),
        viewerVoted: z.boolean().meta({ description: "Whether you upvoted the reply." }),
        target: commentTargetSchema,
        author: userSummarySchema.meta({ description: "The user who replied." }),
      })
      .meta({ description: "The reply to your comment." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("COMMENT_LIKE").meta({ description: "The kind of notification." }),
    comment: z
      .object({
        id: z.uuid().meta({ description: "The ID of your comment." }),
        excerpt: z
          .string()
          .meta({ description: "The start of your comment's text, without its images." }),
        target: commentTargetSchema,
      })
      .meta({ description: "Your upvoted comment." }),
    upvoteCount: z.int().positive().meta({
      description:
        "The number of people who upvoted your comment since the notification opened, leaving out those who took it back. Upvotes stay anonymous.",
    }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("FOLLOW").meta({ description: "The kind of notification." }),
    actors: actorsSchema.meta({ description: "Who started following you." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("RANKING_REWARD").meta({ description: "The kind of notification." }),
    ranking: z
      .object({
        period: z
          .enum(["WEEK", "MONTH"])
          .meta({ description: "The kind of period that closed.", example: "WEEK" }),
        startsAt: z.iso.datetime().meta({ description: "When the period started, in UTC." }),
        endsAt: z.iso.datetime().meta({ description: "When the period ended, in UTC." }),
        rank: z.int().positive().meta({ description: "Your final rank.", example: 2 }),
        chapters: z.int().positive().meta({
          description: "The number of chapters you read and got credit for in the period.",
          example: 87,
        }),
        points: z.int().positive().meta({
          description: "The number of points added to your balance.",
          example: 150,
        }),
      })
      .meta({ description: "Your result in the readers ranking of a period that closed." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("ACHIEVEMENT_EARNED").meta({ description: "The kind of notification." }),
    achievement: z
      .object({
        key: z
          .enum(ACHIEVEMENT_KEYS)
          .meta({ description: "The key of the achievement.", example: "weeklyChampion" }),
        category: z
          .enum(ACHIEVEMENT_CATEGORIES)
          .meta({ description: "The category of the achievement.", example: "ranking" }),
        rarity: z
          .enum(COSMETIC_RARITIES)
          .meta({ description: "The rarity of the achievement.", example: "epic" }),
        points: z.int().nonnegative().meta({
          description: "The number of points the achievement added to your balance.",
          example: 0,
        }),
      })
      .meta({ description: "The achievement you earned." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("LIST_MODERATED").meta({ description: "The kind of notification." }),
    action: z.enum(LIST_MODERATION_ACTIONS).meta({
      description: "What the moderation team did to your list: `UPDATED` or `DELETED`.",
      example: "UPDATED",
    }),
    list: z
      .object({
        id: z.uuid().meta({ description: "The ID of the list." }),
        name: z.string().meta({ description: "The name of the list.", example: "Best shounen" }),
        deleted: deletedSchema("list"),
      })
      .meta({ description: "Your list." }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("PROFILE_MODERATED").meta({ description: "The kind of notification." }),
    fields: z
      .enum(PROFILE_MODERATION_FIELDS)
      .meta({
        description:
          "A part of your profile: `displayUsername`, `about`, `city`, `avatar` or `banner`.",
        example: "avatar",
      })
      .array()
      .meta({
        description: "The parts of your profile the moderation team changed.",
        examples: [["displayUsername", "about"], ["avatar"]],
      }),
  }),
  notificationBaseSchema.extend({
    type: z.literal("REPORT_REVIEWED").meta({ description: "The kind of notification." }),
    report: reportSchema,
  }),
])

export const notificationFiltersSchema = z.object({
  category: z.enum(NOTIFICATION_CATEGORY_NAMES).optional().meta({
    description:
      "Only list this kind: new chapters, replies to your comments, activity (upvotes and follows), rewards (ranking rewards and achievements), or moderation (changes the moderation team made to your lists or profile, and the outcome of your reports).",
    example: "chapters",
  }),
  unread: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .meta({
      description: "Whether to only list the notifications you have not read.",
      example: "true",
    }),
  q: z.string().trim().max(100).optional().meta({
    description:
      "Only list the notifications whose media titles, chapter titles, groups, repliers, followers, comment text, list names or reported users contain this text.",
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
    or "ml"."name" ilike ${pattern}
    or "rg"."name" ilike ${pattern}
    or "ru"."username" ilike ${pattern}
    or "ru"."displayUsername" ilike ${pattern}
  )`
}

export const selectVisibleNotifications = (
  db: Kysely<DB>,
  userId: string,
  { category, unread = false, q = "" }: NotificationFilters = {},
) =>
  db
    .selectFrom("notifications as n")
    // A page or comment report keeps its chapter or comment in the payload: the same joins
    // resolve it.
    .leftJoin("chapters as ch", (join) =>
      join.on(
        sql<SqlBool>`"ch"."id" = coalesce("n"."chapterId", ("n"."payload" ->> 'chapterId')::uuid)`,
      ),
    )
    .leftJoin("medias as md", "md.id", "ch.mediaId")
    .leftJoin("comments as c", (join) =>
      join.on(
        sql<SqlBool>`"c"."id" = coalesce("n"."commentId", ("n"."payload" ->> 'commentId')::uuid)`,
      ),
    )
    .leftJoin("users as u", "u.id", "c.authorId")
    .leftJoin("commentThreads as t", "t.id", "c.threadId")
    .leftJoin("rankingResults as rr", "rr.id", "n.rankingResultId")
    .leftJoin("rankingPeriods as rp", "rp.id", "rr.periodId")
    .leftJoin("userLists as ml", (join) =>
      join.on(sql<SqlBool>`"ml"."id" = ("n"."payload" ->> 'listId')::uuid`),
    )
    .leftJoin("groups as rg", (join) =>
      join.on(sql<SqlBool>`"rg"."id" = ("n"."payload" ->> 'groupId')::uuid`),
    )
    .leftJoin("users as ru", (join) =>
      join.on(sql<SqlBool>`"ru"."id" = ("n"."payload" ->> 'userId')::uuid`),
    )
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
        eb.and([eb("n.type", "=", "RANKING_REWARD"), eb("rr.id", "is not", null)]),
        eb.and([
          eb("n.type", "=", "ACHIEVEMENT_EARNED"),
          eb("n.achievement", "in", ACHIEVEMENT_KEYS),
        ]),
        eb.and([eb("n.type", "=", "LIST_MODERATED"), eb("ml.id", "is not", null)]),
        eb("n.type", "in", ["PROFILE_MODERATED", "REPORT_REVIEWED"]),
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
      unreadOf("rewards").as("rewards"),
      unreadOf("moderation").as("moderation"),
    ])
    .executeTakeFirstOrThrow()

  return {
    total: Number(row.total),
    unread: Number(row.unread),
    categories: {
      chapters: Number(row.chapters),
      replies: Number(row.replies),
      activity: Number(row.activity),
      rewards: Number(row.rewards),
      moderation: Number(row.moderation),
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
const MODERATION_TYPES = NOTIFICATION_CATEGORIES.moderation
const storedReportSchema = z.object({
  reportId: z.guid(),
  outcome: z.enum(["RESOLVED", "DISMISSED"]),
})
/** What each moderation notification stores, checked again when it is read. */
const moderationPayloadSchemas = {
  LIST_MODERATED: z.object({ listId: z.guid(), action: z.enum(LIST_MODERATION_ACTIONS) }),
  PROFILE_MODERATED: z.object({ fields: z.enum(PROFILE_MODERATION_FIELDS).array().min(1) }),
  REPORT_REVIEWED: z.discriminatedUnion("kind", [
    storedReportSchema.extend({ kind: z.literal("PAGE"), chapterId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("COMMENT"), commentId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("GROUP"), groupId: z.guid() }),
    storedReportSchema.extend({ kind: z.literal("USER"), userId: z.guid() }),
  ]),
} satisfies Record<(typeof MODERATION_TYPES)[number], z.ZodType<NotificationPayload>>

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
      "n.achievement",
      "rp.kind as rankingKind",
      timestampSql("rp.startsAt").$castTo<string | null>().as("rankingStartsAt"),
      timestampSql("rp.endsAt").$castTo<string | null>().as("rankingEndsAt"),
      "rr.rank as rankingRank",
      "rr.chapters as rankingChapters",
      "rr.points as rankingPoints",
      "n.payload",
      sql<boolean>`("ch"."deletedAt" is not null or "md"."deletedAt" is not null)`.as(
        "chapterDeleted",
      ),
      liveCommentSql("c", "u").as("commentLive"),
      "ml.name as listName",
      sql<boolean>`"ml"."deletedAt" is not null`.as("listDeleted"),
      "rg.name as groupName",
      sql<boolean>`"rg"."deletedAt" is not null`.as("groupDeleted"),
      "ru.username as reportedUsername",
      "ru.displayUsername as reportedDisplayUsername",
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
  const published = rows.filter((row) => row.type === "CHAPTER_PUBLISHED")
  const chapterIds = published.flatMap((row) => row.chapterId ?? [])
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
      published.flatMap((row) => row.mediaId ?? []),
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
  const reportOf = (
    row: (typeof rows)[number],
    payload: z.infer<typeof moderationPayloadSchemas.REPORT_REVIEWED>,
  ) => {
    const report = { id: payload.reportId, outcome: payload.outcome }

    if (payload.kind === "PAGE") {
      return {
        ...report,
        kind: payload.kind,
        chapter:
          row.chapterId === null || row.mediaId === null
            ? null
            : {
                id: row.chapterId,
                number: row.chapterNumber ?? 0,
                title: row.chapterTitle,
                mediaId: row.mediaId,
                mediaTitle: titles.get(row.mediaId) ?? null,
                deleted: row.chapterDeleted,
              },
      }
    }

    if (payload.kind === "COMMENT") {
      return {
        ...report,
        kind: payload.kind,
        comment:
          row.commentId === null
            ? null
            : {
                id: row.commentId,
                excerpt: row.commentLive ? excerptOf(row.commentContent) : null,
                deleted: !row.commentLive,
                target: targetOf(row),
              },
      }
    }

    if (payload.kind === "GROUP") {
      return {
        ...report,
        kind: payload.kind,
        group:
          row.groupName === null
            ? null
            : { id: payload.groupId, name: row.groupName, deleted: row.groupDeleted },
      }
    }

    return {
      ...report,
      kind: payload.kind,
      user:
        row.reportedUsername === null || row.reportedDisplayUsername === null
          ? null
          : {
              id: payload.userId,
              username: row.reportedUsername,
              displayUsername: row.reportedDisplayUsername,
            },
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

      if (row.type === "RANKING_REWARD") {
        return (row.rankingKind !== "WEEK" && row.rankingKind !== "MONTH") ||
          row.rankingStartsAt === null ||
          row.rankingEndsAt === null ||
          row.rankingRank === null ||
          row.rankingChapters === null ||
          row.rankingPoints === null
          ? null
          : {
              ...base,
              type: row.type,
              ranking: {
                period: row.rankingKind,
                startsAt: row.rankingStartsAt,
                endsAt: row.rankingEndsAt,
                rank: row.rankingRank,
                chapters: row.rankingChapters,
                points: row.rankingPoints,
              },
            }
      }

      if (row.type === "ACHIEVEMENT_EARNED") {
        if (!isAchievementKey(row.achievement)) {
          return null
        }

        const { category, rarity, rewards } = ACHIEVEMENTS[row.achievement]

        return {
          ...base,
          type: row.type,
          achievement: {
            key: row.achievement,
            category,
            rarity,
            points: rewards.points ?? 0,
          },
        }
      }

      if (row.type === "FOLLOW") {
        const followers = actors.get(row.id)

        return followers === undefined ? null : { ...base, type: row.type, actors: followers }
      }

      if (row.type === "LIST_MODERATED") {
        const payload = moderationPayloadSchemas.LIST_MODERATED.safeParse(row.payload)

        return !payload.success || row.listName === null
          ? null
          : {
              ...base,
              type: row.type,
              action: payload.data.action,
              list: { id: payload.data.listId, name: row.listName, deleted: row.listDeleted },
            }
      }

      if (row.type === "PROFILE_MODERATED") {
        const payload = moderationPayloadSchemas.PROFILE_MODERATED.safeParse(row.payload)

        return payload.success ? { ...base, type: row.type, fields: payload.data.fields } : null
      }

      if (row.type === "REPORT_REVIEWED") {
        const payload = moderationPayloadSchemas.REPORT_REVIEWED.safeParse(row.payload)

        return payload.success
          ? { ...base, type: row.type, report: reportOf(row, payload.data) }
          : null
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

type ModerationNotice = {
  [Type in keyof typeof moderationPayloadSchemas]: {
    type: Type
    userId: string
    payload: z.infer<(typeof moderationPayloadSchemas)[Type]>
  }
}[keyof typeof moderationPayloadSchemas]

/** What a route that notifies of a moderation action has once it is signed in and in a transaction. */
export type ModerationContext = {
  db: Kysely<DB>
  user: { id: string }
  afterCommit: (callback: () => Promise<void>) => void
  notificationEvents: NotificationEvents
}

/**
 * Tells people what the moderation team did to their lists, their profile or their reports: one
 * notification per notice, never gathered, and none for the moderator who acted. Nobody can turn
 * these off. The inboxes hear of them once the transaction commits.
 */
export const notifyModeration = async (
  { db, user, afterCommit, notificationEvents }: ModerationContext,
  notices: readonly ModerationNotice[],
) => {
  const kept = notices.filter((notice) => notice.userId !== user.id)

  if (kept.length === 0) {
    return
  }

  await db
    .insertInto("notifications")
    .values(kept.map(({ type, userId, payload }) => ({ type, userId, payload })))
    .execute()

  afterCommit(() => notificationEvents.publish([...new Set(kept.map(({ userId }) => userId))]))
}
