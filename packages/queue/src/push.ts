import type { DB, NotificationType } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import { getCoverUrl } from "@taiyomoe/s3"
import { getCommentText } from "@taiyomoe/schemas/comment-content"
import { sql, type Kysely } from "kysely"
import webpush from "web-push"
import { env } from "./env"

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
    const { method, headers, body } = webpush.generateRequestDetails(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(message),
      { vapidDetails, TTL: config.notifications.pushTtlSeconds, urgency: "normal" },
    )
    const response = await fetch(endpoint, {
      method,
      headers: Object.fromEntries(
        Object.entries(headers).filter(([name]) => name.toLowerCase() !== "content-length"),
      ),
      body,
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
  subscriptionId: string
  endpoint: string
  p256dh: string
  auth: string
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
}

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
const toMessage = (row: PushRow) => {
  const open = (path: string) =>
    `/notifications/open?id=${row.notificationId}&to=${encodeURIComponent(path)}`

  if (row.type === "CHAPTER_PUBLISHED") {
    const chapter = `New chapter ${row.chapterNumber ?? ""}`

    return {
      title: row.mediaTitle ?? "New chapter",
      body: row.groups === null ? chapter : `${chapter} by ${row.groups}`,
      url: open(`/chapters/${row.chapterId ?? ""}`),
      icon:
        row.mediaId === null || row.coverId === null || row.coverExtension === null
          ? null
          : getCoverUrl(row.mediaId, row.coverId, row.coverExtension),
      tag: row.notificationId,
    } satisfies PushMessage
  }

  const text = Array.from(
    graphemes.segment(getCommentText(row.commentContent ?? "")),
    ({ segment }) => segment,
  )
  const excerpt =
    text.length === 0
      ? "An image"
      : `${text.slice(0, EXCERPT_LENGTH).join("")}${text.length > EXCERPT_LENGTH ? "…" : ""}`
  const others = Number(row.actorCount ?? 1) - 1
  const actors =
    others === 0
      ? (row.actorName ?? "Someone")
      : `${row.actorName ?? "Someone"} and ${others} ${others === 1 ? "other" : "others"}`

  if (row.type === "FOLLOW") {
    return {
      title: `${actors} started following you`,
      body: others === 0 ? `@${row.actorUsername ?? ""}` : "See who in your inbox",
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
    const count = Number(row.actorCount ?? 1)

    return {
      title: `${count} ${count === 1 ? "reader" : "readers"} upvoted your comment`,
      body: excerpt,
      url: open(commentPath(row)),
      icon: null,
      tag: row.notificationId,
    } satisfies PushMessage
  }

  return {
    title: `${row.authorName ?? "Someone"} replied to your comment`,
    body: text.length === 0 ? "Sent an image" : excerpt,
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
      "ps"."id" AS "subscriptionId",
      "ps"."endpoint",
      "ps"."p256dh",
      "ps"."auth",
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
      "act"."image" AS "actorImage"
    FROM "notifications" AS "n"
    INNER JOIN "users" AS "u" ON "u"."id" = "n"."userId"
    INNER JOIN "pushSubscriptions" AS "ps" ON "ps"."userId" = "n"."userId"
    LEFT JOIN "chapters" AS "ch" ON "ch"."id" = "n"."chapterId"
    LEFT JOIN "medias" AS "m" ON "m"."id" = "ch"."mediaId"
    LEFT JOIN LATERAL (
      SELECT "cover"."id", "cover"."extension" FROM "covers" AS "cover"
      WHERE "cover"."mediaId" = "ch"."mediaId" AND "cover"."isMainCover" AND "cover"."deletedAt" IS NULL
      LIMIT 1
    ) AS "cv" ON true
    LEFT JOIN "comments" AS "c" ON "c"."id" = "n"."commentId"
    LEFT JOIN "users" AS "au" ON "au"."id" = "c"."authorId"
    LEFT JOIN "commentThreads" AS "th" ON "th"."id" = "c"."threadId"
    LEFT JOIN "users" AS "pu" ON "pu"."id" = "th"."profileId"
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
