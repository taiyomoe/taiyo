import {
  ACHIEVEMENT_KEYS,
  type DB,
  type Kysely,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type SqlBool,
  sql,
} from "@taiyomoe/db"
import type { NotificationFilters } from "./schemas"
import { bannedSql, liveCommentSql, visibleThreadTargetSql } from "../comments"
import { escapeLike } from "../escape-like"

/** People behind a FOLLOW or COMMENT_LIKE notification (aliases n, na, au) who still follow or upvote. */
export const liveActorSql = sql<SqlBool>`(
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
    .leftJoin("dataExports as de", (join) =>
      join.on(sql<SqlBool>`"de"."id" = ("n"."payload" ->> 'exportId')::uuid`),
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
        eb.and([eb("n.type", "=", "DATA_EXPORT_READY"), eb("de.id", "is not", null)]),
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
      unreadOf("account").as("account"),
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
      account: Number(row.account),
    },
  }
}
