import { COMMENT_REPORT_REASONS, COMMENT_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { timestampSql } from "../utils/comments"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { reviewReportSchema, reviewSchema, selectReviews, toReview } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(COMMENT_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "The status of the reports to list.", example: "OPEN" }),
  reason: z.enum(COMMENT_REPORT_REASONS).optional().meta({
    description: "Only list the reviews with at least one report for this reason.",
    example: "SPOILER",
  }),
})
const reportedReviewSchema = z.object({
  reportId: z.uuid().meta({
    description:
      "The ID of the latest report on the review. Closing it closes the other reports on the review too.",
  }),
  review: reviewSchema
    .extend({
      deletedAt: z.iso
        .datetime()
        .nullable()
        .meta({ description: "When the review was deleted, if it was." }),
      deletedByAuthor: z
        .boolean()
        .meta({ description: "Whether the author deleted the review themselves." }),
    })
    .meta({ description: "The reported review, kept even after it was deleted." }),
  media: z
    .object({
      id: z.uuid().meta({ description: "The ID of the media." }),
      title: z.string().nullable().meta({ description: "The main title of the media, if any." }),
      coverUrl: z
        .string()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
    })
    .meta({ description: "The reviewed media." }),
  reports: reviewReportSchema.array().meta({
    description:
      "The latest reports on the review with the requested status, up to 5, newest first.",
  }),
  reportCount: z.int().meta({
    description: "The number of reports on the review with the requested status.",
    example: 3,
  }),
})

export const listReviewReportsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List review reports",
    description:
      "Lists the reported reviews that have reports with the given `status`, one entry per review. `OPEN` reports come oldest first, closed ones most recently closed first.\n\n**Required roles:** moderator, admin.",
    tags: ["Review reports"],
    responses: {
      200: {
        description: "The reported reviews.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(reportedReviewSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("mediaReview.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db, user, can } = c.var
    const { page, perPage, status, reason } = c.var.query
    const grouped = db
      .selectFrom("mediaReviewReports as r")
      .select([
        "r.reviewId",
        sql<string>`count(*)`.as("reportCount"),
        sql<Date>`min("r"."createdAt")`.as("firstAt"),
        sql<Date>`max(coalesce("r"."resolvedAt", "r"."createdAt"))`.as("lastAt"),
        sql<string>`(array_agg("r"."id" order by "r"."createdAt" desc))[1]`.as("reportId"),
      ])
      .where("r.status", "=", status)
      .groupBy("r.reviewId")
      .having((eb) =>
        reason === undefined
          ? eb.and([])
          : sql<boolean>`bool_or(${eb.ref("r.reason")} = ${reason})`,
      )
    const [groups, totalRow] = await Promise.all([
      db
        .selectFrom(grouped.as("g"))
        .selectAll()
        .orderBy(status === "OPEN" ? "g.firstAt" : "g.lastAt", status === "OPEN" ? "asc" : "desc")
        .orderBy("g.reviewId")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom(grouped.as("g"))
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const reviewIds = groups.map((group) => group.reviewId)

    if (reviewIds.length === 0) {
      return c.ok([], { page, perPage, total: Number(totalRow.count) })
    }

    const [reviews, reports] = await Promise.all([
      selectReviews(db, user.id)
        .select([
          sql<string | null>`to_char("rv"."deletedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
            "deletedAt",
          ),
          sql<boolean>`coalesce("rv"."deleterId" = "rv"."userId", false)`.as("deletedByAuthor"),
        ])
        .where("rv.id", "in", reviewIds)
        .execute(),
      db
        .selectFrom((eb) =>
          eb
            .selectFrom("mediaReviewReports as r")
            .innerJoin("users as ru", "ru.id", "r.reporterId")
            .select([
              "r.id",
              "r.reviewId",
              "r.reason",
              "r.details",
              "r.createdAt as createdOn",
              timestampSql("r.createdAt").as("createdAt"),
              "ru.id as reporterId",
              "ru.username",
              "ru.displayUsername",
              "ru.nameEffect",
              sql<string>`row_number() over (partition by "r"."reviewId" order by "r"."createdAt" desc)`.as(
                "rank",
              ),
            ])
            .where("r.reviewId", "in", reviewIds)
            .where("r.status", "=", status)
            .as("ranked"),
        )
        .selectAll()
        .where("ranked.rank", "<=", "5")
        .orderBy("ranked.createdOn", "desc")
        .execute(),
    ])
    const mediaIds = [...new Set(reviews.map((review) => review.mediaId))]
    const [titles, covers] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])
    const reviewById = new Map(reviews.map((row) => [row.id, row]))
    const viewer = { id: user.id, canModerate: can("mediaReview.delete") }

    return c.ok(
      groups.flatMap((group) => {
        const row = reviewById.get(group.reviewId)

        if (row === undefined) {
          return []
        }

        return [
          {
            reportId: group.reportId,
            review: {
              ...toReview(row, viewer),
              deletedAt: row.deletedAt,
              deletedByAuthor: row.deletedByAuthor,
            },
            media: {
              id: row.mediaId,
              title: titles.get(row.mediaId) ?? null,
              coverUrl: covers.get(row.mediaId) ?? null,
            },
            reports: reports
              .filter((report) => report.reviewId === group.reviewId)
              .map((report) => ({
                id: report.id,
                reason: report.reason,
                details: report.details,
                createdAt: report.createdAt,
                reporter: {
                  id: report.reporterId,
                  username: report.username,
                  displayUsername: report.displayUsername,
                  nameEffect: report.nameEffect,
                },
              })),
            reportCount: Number(group.reportCount),
          },
        ]
      }),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
