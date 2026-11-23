import { config } from "@taiyomoe/config"
import { COMMENT_REPORT_REASONS, type DB, type Kysely, sql } from "@taiyomoe/db"
import {
  countReviewCharacters,
  countReviewCodePoints,
  normalizeReviewBody,
} from "@taiyomoe/schemas/review-body"
import z from "zod"
import { bannedSql, timestampSql } from "./comments"
import { userSummarySchema } from "./schemas"

export const REVIEW_SORTS = ["helpful", "newest", "highest", "lowest"] as const

export type ReviewSort = (typeof REVIEW_SORTS)[number]

const { minBodyLength, maxBodyLength } = config.reviews

export const reviewBodySchema = z
  .string()
  .max(maxBodyLength * 4)
  .transform(normalizeReviewBody)
  .refine((body) => countReviewCharacters(body) >= minBodyLength, {
    message: `The review must be at least ${minBodyLength} characters long.`,
  })
  .refine((body) => countReviewCodePoints(body) <= maxBodyLength, {
    message: `The review must be at most ${maxBodyLength} characters long.`,
  })
  .meta({
    description: `The text of the review, from ${minBodyLength} to ${maxBodyLength} characters. Plain text: line breaks are kept, and markup is shown as typed.`,
    example:
      "The first arc takes its time, but the payoff in the second half is worth every slow chapter.",
  })

export const reviewSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the review." }),
  mediaId: z.uuid().meta({ description: "The ID of the reviewed media." }),
  body: z.string().meta({ description: "The text of the review, in plain text." }),
  containsSpoilers: z
    .boolean()
    .meta({ description: "Whether the author marked the review as revealing the story." }),
  helpfulCount: z
    .int()
    .nonnegative()
    .meta({ description: "How many users found the review helpful.", example: 12 }),
  score: z
    .int()
    .nullable()
    .meta({ description: "The author's score for the media, if they still rate it.", example: 8 }),
  createdAt: z.iso.datetime().meta({ description: "When the review was written." }),
  editedAt: z.iso
    .datetime()
    .nullable()
    .meta({ description: "When the author last changed the review, if they did." }),
  author: userSummarySchema.meta({ description: "The user who wrote the review." }),
  viewer: z
    .object({
      voted: z.boolean().meta({ description: "Whether you marked the review as helpful." }),
      canEdit: z.boolean().meta({ description: "Whether you wrote the review." }),
      canDelete: z.boolean().meta({ description: "Whether you can delete the review." }),
      canReport: z.boolean().meta({ description: "Whether you can report the review." }),
    })
    .nullable()
    .meta({ description: "What you can do with the review, or `null` when signed out." }),
})

/** A review the public sees: not deleted, by an author who is not banned. */
export const liveReviewSql = (review: string, author: string) =>
  sql<boolean>`(${sql.ref(`${review}.deletedAt`)} is null and not ${bannedSql(author)})`

export const selectReviews = (db: Kysely<DB>, viewerId: string | null) =>
  db
    .selectFrom("mediaReviews as rv")
    .innerJoin("users as u", "u.id", "rv.userId")
    .leftJoin("mediaRatings as mr", (join) =>
      join.onRef("mr.userId", "=", "rv.userId").onRef("mr.mediaId", "=", "rv.mediaId"),
    )
    .select([
      "rv.id",
      "rv.mediaId",
      "rv.body",
      "rv.containsSpoilers",
      "rv.helpfulCount",
      "mr.score",
      timestampSql("rv.createdAt").as("createdAt"),
      sql<
        string | null
      >`case when "rv"."updatedAt" > "rv"."createdAt" then to_char("rv"."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end`.as(
        "editedAt",
      ),
      sql<string>`to_char("rv"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS')`.as("cursorAt"),
      "u.id as authorId",
      "u.username as authorUsername",
      "u.displayUsername as authorDisplayUsername",
      "u.image as authorImage",
      "u.nameEffect as authorNameEffect",
      "u.avatarBorder as authorAvatarBorder",
      (viewerId === null
        ? sql<boolean>`false`
        : sql<boolean>`exists (select 1 from "mediaReviewVotes" as "v" where "v"."reviewId" = "rv"."id" and "v"."userId" = ${viewerId})`
      ).as("viewerVoted"),
    ])

type ReviewRow = Awaited<ReturnType<ReturnType<typeof selectReviews>["executeTakeFirstOrThrow"]>>

export type ReviewViewer = { id: string; canModerate: boolean } | null

export const toReview = (row: ReviewRow, viewer: ReviewViewer) => {
  const isAuthor = viewer?.id === row.authorId

  return {
    id: row.id,
    mediaId: row.mediaId,
    body: row.body,
    containsSpoilers: row.containsSpoilers,
    helpfulCount: row.helpfulCount,
    score: row.score,
    createdAt: row.createdAt,
    editedAt: row.editedAt,
    author: {
      id: row.authorId,
      username: row.authorUsername,
      displayUsername: row.authorDisplayUsername,
      image: row.authorImage,
      nameEffect: row.authorNameEffect,
      avatarBorder: row.authorAvatarBorder,
    },
    viewer:
      viewer === null
        ? null
        : {
            voted: row.viewerVoted,
            canEdit: isAuthor,
            canDelete: isAuthor || viewer.canModerate,
            canReport: !isAuthor,
          },
  } satisfies z.infer<typeof reviewSchema>
}

export const REVIEW_SORT_KEYS = {
  helpful: "rv.helpfulCount",
  highest: "mr.score",
  lowest: "mr.score",
  newest: null,
} as const

const cursorSchema = z.tuple([z.int(), z.string(), z.uuid()])

export const encodeReviewCursor = (row: ReviewRow, sort: ReviewSort) => {
  const primary = { helpful: row.helpfulCount, highest: row.score, lowest: row.score, newest: 0 }[
    sort
  ]

  return Buffer.from(JSON.stringify([primary ?? 0, row.cursorAt, row.id])).toString("base64url")
}

export const decodeReviewCursor = (cursor: string | undefined) => {
  if (cursor === undefined) {
    return null
  }

  try {
    const parsed = cursorSchema.safeParse(JSON.parse(Buffer.from(cursor, "base64url").toString()))

    return parsed.success && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(parsed.data[1])
      ? { primary: parsed.data[0], at: parsed.data[1], id: parsed.data[2] }
      : null
  } catch {
    return null
  }
}

/** The reviews after `cursor` in `sort` order, which breaks ties newest first. */
export const reviewsAfter = (
  sort: ReviewSort,
  cursor: NonNullable<ReturnType<typeof decodeReviewCursor>>,
) => {
  const key = REVIEW_SORT_KEYS[sort]
  const newer = sql<boolean>`("rv"."createdAt", "rv"."id") < (${cursor.at}::timestamp, ${cursor.id}::uuid)`

  return key === null
    ? newer
    : sql<boolean>`(${sql.ref(key)} ${sql.raw(sort === "lowest" ? ">" : "<")} ${cursor.primary} or (${sql.ref(key)} = ${cursor.primary} and ${newer}))`
}

/** Deletes the user's live review of the media in their name and returns its ID, if they had one. */
export const deleteOwnReview = (
  db: Kysely<DB>,
  { userId, mediaId }: { userId: string; mediaId: string },
) =>
  db
    .updateTable("mediaReviews")
    .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deleterId: userId })
    .where("userId", "=", userId)
    .where("mediaId", "=", mediaId)
    .where("deletedAt", "is", null)
    .returning("id")
    .executeTakeFirst()

/**
 * Moves the reviews of a duplicate onto the media. A user who reviewed both keeps the review they
 * changed last; the other is deleted, with no deleter.
 */
export const mergeReviews = async (
  db: Kysely<DB>,
  { mediaId, duplicateId }: { mediaId: string; duplicateId: string },
) => {
  await db
    .updateTable("mediaReviews as r")
    .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deleterId: null })
    .where("r.mediaId", "in", [mediaId, duplicateId])
    .where("r.deletedAt", "is", null)
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("mediaReviews as o")
          .select("o.id")
          .whereRef("o.userId", "=", "r.userId")
          .whereRef("o.mediaId", "!=", "r.mediaId")
          .where("o.mediaId", "in", [mediaId, duplicateId])
          .where("o.deletedAt", "is", null)
          .where((newer) =>
            newer.or([
              newer("o.updatedAt", ">", newer.ref("r.updatedAt")),
              newer.and([
                newer("o.updatedAt", "=", newer.ref("r.updatedAt")),
                newer("o.mediaId", "=", mediaId),
              ]),
            ]),
          ),
      ),
    )
    .execute()
  await db.updateTable("mediaReviews").set({ mediaId }).where("mediaId", "=", duplicateId).execute()
}

export const reviewReportSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  reason: z
    .enum(COMMENT_REPORT_REASONS)
    .meta({ description: "Why the review was reported.", example: "SPOILER" }),
  details: z.string().nullable().meta({
    description: "What the reporter told the moderators, if anything.",
    example: "Reveals the ending without the spoiler flag.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the report was made." }),
  reporter: userSummarySchema
    .pick({ id: true, username: true, displayUsername: true, nameEffect: true })
    .meta({ description: "The user who made the report." }),
})

/** Closes every open report on the reviews in the moderator's name and returns how many it closed. */
export const closeReviewReports = async (
  db: Kysely<DB>,
  {
    reviewIds,
    status,
    resolverId,
  }: {
    reviewIds: readonly string[]
    status: "RESOLVED" | "DISMISSED"
    resolverId: string
  },
) => {
  if (reviewIds.length === 0) {
    return 0
  }

  const closed = await db
    .updateTable("mediaReviewReports")
    .set({ status, resolverId, resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
    .where("reviewId", "in", reviewIds)
    .where("status", "=", "OPEN")
    .returning("id")
    .execute()

  return closed.length
}
