import type z from "zod"
import {
  ACHIEVEMENTS,
  COMMENT_TARGET_TYPES,
  type DB,
  isAchievementKey,
  type Kysely,
  sql,
} from "@taiyomoe/db"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { groupBy } from "remeda"
import { liveCommentSql, THREAD_COLUMNS, timestampSql } from "../comments"
import { getMainCoverUrls, getMainTitles } from "../latest-chapters"
import { liveActorSql, selectVisibleNotifications } from "./query"
import {
  type actorsSchema,
  LATEST_ACTORS,
  dataExportPayloadSchema,
  moderationPayloadSchemas,
  type NotificationFilters,
} from "./schemas"

const EXCERPT_LENGTH = 200
const graphemes = new Intl.Segmenter()
const excerptOf = (content: string | null) =>
  Array.from(graphemes.segment(getCommentText(content ?? "")), ({ segment }) => segment)
    .slice(0, EXCERPT_LENGTH)
    .join("")
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
    Object.entries(groupBy(rows, (row) => row.notificationId)).map(([notificationId, actors]) => [
      notificationId,
      {
        count: Number(actors[0].count),
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
    ]),
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
      timestampSql("de.expiresAt").$castTo<string | null>().as("exportExpiresAt"),
      sql<boolean>`("de"."status" = 'EXPIRED' or "de"."expiresAt" <= (CURRENT_TIMESTAMP at time zone 'UTC'))`.as(
        "exportExpired",
      ),
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
  const groupsByChapter = groupBy(credits, (credit) => credit.chapterId)
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
    const report = { id: payload.reportId, outcome: payload.outcome, points: payload.points ?? 0 }

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

      if (row.type === "DATA_EXPORT_READY") {
        const payload = dataExportPayloadSchema.safeParse(row.payload)

        return payload.success
          ? {
              ...base,
              type: row.type,
              dataExport: {
                id: payload.data.exportId,
                expiresAt: row.exportExpiresAt,
                expired: row.exportExpired,
              },
            }
          : null
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
