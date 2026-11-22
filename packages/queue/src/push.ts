import type {
  DB,
  Locale,
  NotificationPayload,
  NotificationType,
  RankingPeriodKind,
} from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { isAchievementKey } from "@taiyomoe/db"
import { getCoverUrl } from "@taiyomoe/s3"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { sql, type Kysely } from "kysely"
import { generateRequestDetails } from "web-push"
import { env } from "./env"
import { PUSH_TEXTS } from "./push-texts"

type PushTarget = { endpoint: string; p256dh: string; auth: string }

export type PushMessage = {
  title: string
  body: string
  url: string
  icon: string | null
  tag: string
}

/** Sends one message and resolves with the push service's HTTP status. */
export type PushSender = (target: PushTarget, message: PushMessage) => Promise<number>

const EXPIRED_STATUSES = new Set([404, 410])
const EXCERPT_LENGTH = 140
const graphemes = new Intl.Segmenter()

export const getVapidPublicKey = () => env.VAPID_PUBLIC_KEY ?? null

// An absolute deadline: web-push's own `timeout` only fires on an idle socket, so an endpoint
// that keeps sending a byte now and then could hold the send, and the notification worker's
// transaction, for as long as it likes.
const SEND_TIMEOUT_MS = 5000

export const createWebPushSender = ({
  subject = env.VAPID_SUBJECT,
  publicKey = env.VAPID_PUBLIC_KEY,
  privateKey = env.VAPID_PRIVATE_KEY,
} = {}) => {
  if (publicKey === undefined || privateKey === undefined || subject === undefined) {
    return null
  }

  const vapidDetails = { subject, publicKey, privateKey }
  const send: PushSender = async ({ endpoint, p256dh, auth }, message) => {
    const { method, headers, body } = generateRequestDetails(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(message),
      { vapidDetails, TTL: config.notifications.pushTtlSeconds, urgency: "normal" },
    )
    const response = await fetch(endpoint, {
      method,
      headers: Object.fromEntries(
        Object.entries(headers).filter(([name]) => name.toLowerCase() !== "content-length"),
      ),
      // A Buffer is a body only to Node's fetch types; a Uint8Array is one to the standard's too.
      body: new Uint8Array(body),
      redirect: "manual",
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })

    // Only the status matters, so the response body is never buffered.
    await response.body?.cancel()

    return response.status
  }

  return send
}

export const isExpiredPushStatus = (status: number) => EXPIRED_STATUSES.has(status)

const ACTIVITY_TYPES = ["COMMENT_LIKE", "FOLLOW"] as const

type PushRow = {
  notificationId: string
  type: NotificationType
  payload: NotificationPayload | null
  recipientUsername: string
  subscriptionId: string
  endpoint: string
  p256dh: string
  auth: string
  locale: Locale
  chapterId: string | null
  chapterNumber: number | null
  mediaId: string | null
  mediaTitle: string | null
  coverId: string | null
  coverExtension: string | null
  groups: string | null
  commentId: string | null
  commentContent: string | null
  authorName: string | null
  authorImage: string | null
  threadMediaId: string | null
  threadChapterId: string | null
  threadGroupId: string | null
  profileUsername: string | null
  actorCount: string | null
  actorName: string | null
  actorUsername: string | null
  actorImage: string | null
  username: string
  rankingKind: RankingPeriodKind | null
  rankingRank: number | null
  rankingPoints: number | null
  achievement: string | null
  chapterDeleted: boolean
  commentLive: boolean
  listName: string | null
  listDeleted: boolean | null
  groupName: string | null
  groupDeleted: boolean | null
  reportedUsername: string | null
  reportedName: string | null
}

const MODERATION_INBOX = "/notifications?category=moderation"
/** The start of a comment's text, or null when it only holds images. */
const excerptOf = (content: string | null) => {
  const text = Array.from(
    graphemes.segment(getCommentText(content ?? "")),
    ({ segment }) => segment,
  )

  return text.length === 0
    ? null
    : `${text.slice(0, EXCERPT_LENGTH).join("")}${text.length > EXCERPT_LENGTH ? "…" : ""}`
}
const getCover = (row: PushRow) =>
  row.mediaId === null || row.coverId === null || row.coverExtension === null
    ? null
    : getCoverUrl(row.mediaId, row.coverId, row.coverExtension)
const commentPath = (row: PushRow) => {
  const query = `comment=${row.commentId ?? ""}`

  if (row.threadMediaId !== null) {
    return `/media/${row.threadMediaId}?tab=comments&${query}`
  }

  if (row.threadChapterId !== null) {
    return `/chapters/${row.threadChapterId}?${query}`
  }

  if (row.threadGroupId !== null) {
    return `/groups/${row.threadGroupId}?tab=comments&${query}`
  }

  if (row.profileUsername !== null) {
    return `/users/${encodeURIComponent(row.profileUsername)}?tab=comments&${query}`
  }

  return "/notifications"
}
/** Where a moderation push leads: what it is about while it can still be opened, else the inbox. */
const moderationPath = (row: PushRow, payload: NotificationPayload) => {
  if ("listId" in payload) {
    return row.listDeleted === false ? `/lists/${payload.listId}` : MODERATION_INBOX
  }

  if ("fields" in payload) {
    return `/users/${encodeURIComponent(row.recipientUsername)}`
  }

  if (payload.kind === "PAGE") {
    return row.chapterId === null || row.chapterDeleted
      ? MODERATION_INBOX
      : `/chapters/${row.chapterId}`
  }

  if (payload.kind === "COMMENT") {
    return row.commentLive ? commentPath(row) : MODERATION_INBOX
  }

  if (payload.kind === "GROUP") {
    return row.groupDeleted === false ? `/groups/${payload.groupId}` : MODERATION_INBOX
  }

  return row.reportedUsername === null
    ? MODERATION_INBOX
    : `/users/${encodeURIComponent(row.reportedUsername)}`
}
/** The moderation team stays anonymous: no name, no avatar. */
const moderationMessage = (row: PushRow, payload: NotificationPayload) => {
  const texts = PUSH_TEXTS[row.locale]
  const message = { url: "", icon: null, tag: row.notificationId }

  if ("listId" in payload) {
    return {
      ...message,
      title: texts.listTitle(payload.action === "DELETED"),
      body: row.listName ?? "",
    } satisfies PushMessage
  }

  if ("fields" in payload) {
    // Avatars and banners can only be removed, the other parts are edited.
    const removed = payload.fields.every((field) => field === "avatar" || field === "banner")
    const fields = new Intl.ListFormat(row.locale, { type: "conjunction" }).format(
      payload.fields.map((field) => texts.profileFields[field]),
    )

    return {
      ...message,
      title: texts.profileTitle,
      body: texts.profileBody(removed, fields),
    } satisfies PushMessage
  }

  const title = texts.reportTitle(payload.outcome === "RESOLVED", payload.points)

  if (payload.kind === "PAGE") {
    return {
      ...message,
      title,
      body:
        row.chapterId === null
          ? texts.aPage
          : texts.pageOf(row.mediaTitle, String(row.chapterNumber ?? "")),
      icon: getCover(row),
    } satisfies PushMessage
  }

  if (payload.kind === "COMMENT") {
    return {
      ...message,
      title,
      body: row.commentLive
        ? (excerptOf(row.commentContent) ?? texts.aComment)
        : texts.aRemovedComment,
    } satisfies PushMessage
  }

  if (payload.kind === "GROUP") {
    return { ...message, title, body: row.groupName ?? texts.aGroup } satisfies PushMessage
  }

  return {
    ...message,
    title,
    body:
      row.reportedName === null
        ? texts.aProfile
        : `${row.reportedName} (@${row.reportedUsername ?? ""})`,
  } satisfies PushMessage
}
const toMessage = (row: PushRow) => {
  const texts = PUSH_TEXTS[row.locale]
  const open = (path: string) =>
    `/notifications/open?id=${row.notificationId}&to=${encodeURIComponent(path)}`

  if (row.type === "CHAPTER_PUBLISHED") {
    return {
      title: row.mediaTitle ?? texts.newChapter,
      body: texts.chapterBody(String(row.chapterNumber ?? ""), row.groups),
      url: open(`/chapters/${row.chapterId ?? ""}`),
      icon: getCover(row),
      tag: row.notificationId,
    } satisfies PushMessage
  }

  if (row.type === "RANKING_REWARD") {
    const kind = row.rankingKind ?? "WEEK"

    return {
      title: texts.rankingTitle(kind, row.rankingRank ?? 0),
      body: texts.points(row.rankingPoints ?? 0),
      url: open(`/rankings?period=${kind === "MONTH" ? "month" : "week"}`),
      icon: null,
      tag: row.notificationId,
    } satisfies PushMessage
  }

  if (row.type === "ACHIEVEMENT_EARNED") {
    return {
      title: texts.achievementUnlocked,
      body: isAchievementKey(row.achievement) ? texts.achievements[row.achievement] : "",
      url: open(`/users/${encodeURIComponent(row.username)}?tab=achievements`),
      icon: null,
      tag: row.notificationId,
    } satisfies PushMessage
  }

  if (row.payload !== null) {
    return { ...moderationMessage(row, row.payload), url: open(moderationPath(row, row.payload)) }
  }

  const excerpt = excerptOf(row.commentContent)

  if (row.type === "FOLLOW") {
    const others = Number(row.actorCount ?? 1) - 1

    return {
      title: texts.followTitle(row.actorName ?? texts.someone, others),
      body: others === 0 ? `@${row.actorUsername ?? ""}` : texts.seeWho,
      url: open(
        others === 0
          ? `/users/${encodeURIComponent(row.actorUsername ?? "")}`
          : "/notifications?category=activity",
      ),
      icon: row.actorImage,
      tag: row.notificationId,
    } satisfies PushMessage
  }

  if (row.type === "COMMENT_LIKE") {
    return {
      title: texts.upvoteTitle(Number(row.actorCount ?? 1)),
      body: excerpt ?? texts.anImage,
      url: open(commentPath(row)),
      icon: null,
      tag: row.notificationId,
    } satisfies PushMessage
  }

  return {
    title: texts.replyTitle(row.authorName ?? texts.someone),
    body: excerpt ?? texts.sentAnImage,
    url: open(commentPath(row)),
    icon: row.authorImage,
    tag: row.notificationId,
  } satisfies PushMessage
}
const loadPushRows = async (db: Kysely<DB>, notificationIds: string[]) => {
  const defaults = config.settings
  const { rows } = await sql<PushRow>`
    SELECT
      "n"."id" AS "notificationId",
      "n"."type",
      "n"."payload",
      "u"."username" AS "recipientUsername",
      "ps"."id" AS "subscriptionId",
      "ps"."endpoint",
      "ps"."p256dh",
      "ps"."auth",
      "ps"."locale",
      "ch"."id" AS "chapterId",
      "ch"."number" AS "chapterNumber",
      "ch"."mediaId",
      (
        SELECT "t"."title" FROM "titles" AS "t"
        WHERE "t"."mediaId" = "ch"."mediaId" AND "t"."isMainTitle" AND "t"."deletedAt" IS NULL
        LIMIT 1
      ) AS "mediaTitle",
      "cv"."id" AS "coverId",
      "cv"."extension" AS "coverExtension",
      (
        SELECT string_agg("g"."name", ', ' ORDER BY "g"."name")
        FROM "chapterGroups" AS "cg"
        INNER JOIN "groups" AS "g" ON "g"."id" = "cg"."groupId" AND "g"."deletedAt" IS NULL
        WHERE "cg"."chapterId" = "ch"."id"
      ) AS "groups",
      "c"."id" AS "commentId",
      "c"."content" AS "commentContent",
      "au"."displayUsername" AS "authorName",
      "au"."image" AS "authorImage",
      "th"."mediaId" AS "threadMediaId",
      "th"."chapterId" AS "threadChapterId",
      "th"."groupId" AS "threadGroupId",
      "pu"."username" AS "profileUsername",
      "act"."count" AS "actorCount",
      "act"."name" AS "actorName",
      "act"."username" AS "actorUsername",
      "act"."image" AS "actorImage",
      "u"."username",
      "rp"."kind" AS "rankingKind",
      "rr"."rank" AS "rankingRank",
      "rr"."points" AS "rankingPoints",
      "n"."achievement",
      ("ch"."deletedAt" IS NOT NULL OR "m"."deletedAt" IS NOT NULL) AS "chapterDeleted",
      ("c"."deletedAt" IS NULL AND "au"."id" IS NOT NULL) AS "commentLive",
      "ml"."name" AS "listName",
      "ml"."deletedAt" IS NOT NULL AS "listDeleted",
      "rg"."name" AS "groupName",
      "rg"."deletedAt" IS NOT NULL AS "groupDeleted",
      "ru"."username" AS "reportedUsername",
      "ru"."displayUsername" AS "reportedName"
    FROM "notifications" AS "n"
    INNER JOIN "users" AS "u" ON "u"."id" = "n"."userId"
    INNER JOIN "pushSubscriptions" AS "ps" ON "ps"."userId" = "n"."userId"
    INNER JOIN "sessions" AS "s" ON "s"."id" = "ps"."sessionId"
      AND "s"."expiresAt" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
    LEFT JOIN "chapters" AS "ch"
      ON "ch"."id" = coalesce("n"."chapterId", ("n"."payload" ->> 'chapterId')::uuid)
    LEFT JOIN "medias" AS "m" ON "m"."id" = "ch"."mediaId"
    LEFT JOIN LATERAL (
      SELECT "cover"."id", "cover"."extension" FROM "covers" AS "cover"
      WHERE "cover"."mediaId" = "ch"."mediaId" AND "cover"."isMainCover" AND "cover"."deletedAt" IS NULL
      LIMIT 1
    ) AS "cv" ON true
    LEFT JOIN "comments" AS "c"
      ON "c"."id" = coalesce("n"."commentId", ("n"."payload" ->> 'commentId')::uuid)
    LEFT JOIN "users" AS "au" ON "au"."id" = "c"."authorId"
    LEFT JOIN "commentThreads" AS "th" ON "th"."id" = "c"."threadId"
    LEFT JOIN "users" AS "pu" ON "pu"."id" = "th"."profileId"
    LEFT JOIN "rankingResults" AS "rr" ON "rr"."id" = "n"."rankingResultId"
    LEFT JOIN "rankingPeriods" AS "rp" ON "rp"."id" = "rr"."periodId"
    LEFT JOIN "userLists" AS "ml" ON "ml"."id" = ("n"."payload" ->> 'listId')::uuid
    LEFT JOIN "groups" AS "rg" ON "rg"."id" = ("n"."payload" ->> 'groupId')::uuid
    LEFT JOIN "users" AS "ru" ON "ru"."id" = ("n"."payload" ->> 'userId')::uuid
    LEFT JOIN LATERAL (
      SELECT
        count(*) AS "count",
        (array_agg("pa"."displayUsername" ORDER BY "na"."createdAt" DESC))[1] AS "name",
        (array_agg("pa"."username" ORDER BY "na"."createdAt" DESC))[1] AS "username",
        (array_agg("pa"."image" ORDER BY "na"."createdAt" DESC))[1] AS "image"
      FROM "notificationActors" AS "na"
      INNER JOIN "users" AS "pa" ON "pa"."id" = "na"."actorId"
      WHERE "na"."notificationId" = "n"."id"
        AND NOT (
          coalesce("pa"."banned", false)
          AND ("pa"."banExpires" IS NULL OR "pa"."banExpires" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))
        )
        AND CASE "n"."type"
          WHEN 'FOLLOW' THEN EXISTS (
            SELECT 1 FROM "userFollows" AS "uf"
            WHERE "uf"."followerId" = "na"."actorId" AND "uf"."followingId" = "n"."userId"
          )
          WHEN 'COMMENT_LIKE' THEN EXISTS (
            SELECT 1 FROM "commentVotes" AS "cvt"
            WHERE "cvt"."commentId" = "n"."commentId" AND "cvt"."userId" = "na"."actorId"
          )
          ELSE false
        END
    ) AS "act" ON "n"."type" IN ('FOLLOW', 'COMMENT_LIKE')
    WHERE "n"."id" IN (${sql.join(notificationIds)})
      AND "n"."readAt" IS NULL
      AND "n"."createdAt" > (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(mins => ${config.notifications.pushMaxAgeMinutes})
      AND (
        (
          "n"."type" = 'CHAPTER_PUBLISHED'
          AND "ch"."status" = 'PUBLISHED'
          AND "ch"."deletedAt" IS NULL
          AND "m"."deletedAt" IS NULL
          AND (
            (
              coalesce(("u"."settings" ->> 'pushLibraryChapters')::boolean, ${defaults.pushLibraryChapters})
              AND EXISTS (
                SELECT 1 FROM "userLibraryEntries" AS "le"
                WHERE "le"."userId" = "n"."userId"
                  AND "le"."mediaId" = "ch"."mediaId"
                  AND "le"."notify"
                  AND "le"."status" NOT IN ('DROPPED', 'COMPLETED')
              )
            )
            OR (
              coalesce(("u"."settings" ->> 'pushGroupChapters')::boolean, ${defaults.pushGroupChapters})
              AND EXISTS (
                SELECT 1 FROM "chapterGroups" AS "cg"
                INNER JOIN "groupFollows" AS "gf" ON "gf"."groupId" = "cg"."groupId"
                WHERE "cg"."chapterId" = "ch"."id" AND "gf"."userId" = "n"."userId"
              )
            )
          )
        )
        OR (
          "n"."type" = 'COMMENT_REPLY'
          AND "c"."deletedAt" IS NULL
          AND "au"."id" IS NOT NULL
          AND coalesce(("u"."settings" ->> 'pushReplies')::boolean, ${defaults.pushReplies})
        )
        OR (
          "n"."type" = 'COMMENT_LIKE'
          AND "c"."deletedAt" IS NULL
          AND "act"."count" > 0
          AND coalesce(("u"."settings" ->> 'pushLikes')::boolean, ${defaults.pushLikes})
        )
        OR (
          "n"."type" = 'FOLLOW'
          AND "act"."count" > 0
          AND coalesce(("u"."settings" ->> 'pushFollows')::boolean, ${defaults.pushFollows})
        )
        OR ("n"."type" = 'RANKING_REWARD' AND "rr"."id" IS NOT NULL)
        OR "n"."type" = 'ACHIEVEMENT_EARNED'
        -- Moderation notices have no setting: people always learn when their content changes.
        OR ("n"."type" = 'LIST_MODERATED' AND "ml"."id" IS NOT NULL)
        OR "n"."type" IN ('PROFILE_MODERATED', 'REPORT_REVIEWED')
      )
  `.execute(db)

  return rows
}
const sendBatch = async (db: Kysely<DB>, send: PushSender | null) => {
  const claimed = await db
    .selectFrom("notifications")
    .select("id")
    .where("pushedAt", "is", null)
    .where((eb) =>
      eb.or([
        eb("type", "not in", ACTIVITY_TYPES),
        eb(
          "createdAt",
          "<=",
          sql<Date>`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - make_interval(mins => ${config.notifications.activityPushDelayMinutes})`,
        ),
      ]),
    )
    .orderBy("createdAt")
    .limit(config.notifications.pushBatchSize)
    .forUpdate()
    .skipLocked()
    .execute()
  const result = { notifications: claimed.length, sent: 0, failed: 0, expired: 0 }

  if (claimed.length === 0) {
    return result
  }

  const ids = claimed.map(({ id }) => id)
  const rows = send === null ? [] : await loadPushRows(db, ids)
  const expired = new Set<string>()

  for (let i = 0; i < rows.length; i += config.notifications.pushConcurrency) {
    await Promise.all(
      rows.slice(i, i + config.notifications.pushConcurrency).map(async (row) => {
        const status = await (send?.(row, toMessage(row)) ?? Promise.resolve(0)).catch(() => 0)

        if (isExpiredPushStatus(status)) {
          expired.add(row.subscriptionId)
        } else if (status >= 200 && status < 300) {
          result.sent += 1
        } else {
          result.failed += 1
        }
      }),
    )
  }

  if (expired.size > 0) {
    await db
      .deleteFrom("pushSubscriptions")
      .where("id", "in", [...expired])
      .execute()
  }

  await db
    .updateTable("notifications")
    .set({ pushedAt: sql<Date>`CURRENT_TIMESTAMP` })
    .where("id", "in", ids)
    .execute()

  return { ...result, expired: expired.size }
}

/**
 * Sends a Web Push for every notification not pushed yet, to each of its recipient's
 * devices, then marks it pushed. A crash before the commit sends the batch again; the
 * notification id is the push `tag`, so a device shows it once. Upvotes and follows wait
 * `activityPushDelayMinutes` first, so a burst of them goes out as one push.
 */
export const sendPendingPushes = async ({
  db,
  send,
}: {
  db: Kysely<DB>
  send: PushSender | null
}) => {
  const totals = { notifications: 0, sent: 0, failed: 0, expired: 0 }

  for (;;) {
    const batch = await db.transaction().execute((trx) => sendBatch(trx, send))

    if (batch.notifications === 0) {
      return totals
    }

    totals.notifications += batch.notifications
    totals.sent += batch.sent
    totals.failed += batch.failed
    totals.expired += batch.expired
  }
}
