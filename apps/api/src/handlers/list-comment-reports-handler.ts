import { COMMENT_REPORT_REASONS, COMMENT_REPORT_STATUSES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  commentSchema,
  getCommentTargets,
  labelledCommentTargetSchema,
  loadCommentImages,
  selectComments,
  toComment,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(COMMENT_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "The status of the reports to list.", example: "OPEN" }),
})
const reportSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  reason: z
    .enum(COMMENT_REPORT_REASONS)
    .meta({ description: "Why the comment was reported.", example: "SPAM" }),
  details: z.string().nullable().meta({
    description: "What the reporter told the moderators, if anything.",
    example: "Reveals the ending of the series without a spoiler tag.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the report was made." }),
  reporter: userSummarySchema
    .pick({ id: true, username: true, displayUsername: true, nameEffect: true })
    .meta({ description: "The user who made the report." }),
})
const reportedCommentSchema = z.object({
  reportId: z.uuid().meta({
    description:
      "The ID of the latest report on the comment. Closing it closes the other reports on the comment too.",
  }),
  comment: commentSchema
    .extend({
      originalContent: z.string().meta({
        description: "The rich text of the comment, kept even after it was removed.",
        example: "That last panel was incredible.",
      }),
      originalImages: commentSchema.shape.images.meta({
        description: "The images in the comment, kept even after it was removed.",
      }),
    })
    .meta({ description: "The reported comment." }),
  target: labelledCommentTargetSchema.meta({ description: "The resource the comment is on." }),
  reports: reportSchema.array().meta({
    description:
      "The latest reports on the comment with the requested status, up to 5, newest first.",
  }),
  reportCount: z.int().meta({
    description: "The number of reports on the comment with the requested status.",
    example: 3,
  }),
})

export const listCommentReportsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List comment reports",
    description:
      "Lists the reported comments that have reports with the given `status`, one entry per comment. `OPEN` reports come oldest first, closed ones most recently closed first.\n\n**Required roles:** moderator, admin.",
    tags: ["Comment reports"],
    responses: {
      200: {
        description: "The reported comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(reportedCommentSchema.array(), paginationMetaSchema),
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
  withAuth("comment.review"),
  validateQuery(querySchema),
  async (c) => {
    const { db, user, can } = c.var
    const { page, perPage, status } = c.var.query
    const grouped = db
      .selectFrom("commentReports")
      .select([
        "commentId",
        sql<string>`count(*)`.as("reportCount"),
        sql<Date>`min("createdAt")`.as("firstAt"),
        sql<Date>`max(coalesce("resolvedAt", "createdAt"))`.as("lastAt"),
        sql<string>`(array_agg("id" order by "createdAt" desc))[1]`.as("reportId"),
      ])
      .where("status", "=", status)
      .groupBy("commentId")
    const [groups, totalRow] = await Promise.all([
      db
        .selectFrom(grouped.as("g"))
        .selectAll()
        .orderBy(status === "OPEN" ? "g.firstAt" : "g.lastAt", status === "OPEN" ? "asc" : "desc")
        .orderBy("g.commentId")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom(grouped.as("g"))
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const commentIds = groups.map((group) => group.commentId)

    if (commentIds.length === 0) {
      return c.ok([], { page, perPage, total: Number(totalRow.count) })
    }

    const [comments, targets, reports, images] = await Promise.all([
      selectComments(db, user.id).where("c.id", "in", commentIds).execute(),
      getCommentTargets(db, commentIds),
      db
        .selectFrom(
          db
            .selectFrom("commentReports as r")
            .innerJoin("users as ru", "ru.id", "r.reporterId")
            .select([
              "r.id",
              "r.commentId",
              "r.reason",
              "r.details",
              sql<string>`to_char("r"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
                "createdAt",
              ),
              "ru.id as reporterId",
              "ru.username",
              "ru.displayUsername",
              "ru.nameEffect",
              sql<string>`row_number() over (partition by "r"."commentId" order by "r"."createdAt" desc)`.as(
                "rank",
              ),
            ])
            .where("r.commentId", "in", commentIds)
            .where("r.status", "=", status)
            .as("ranked"),
        )
        .selectAll()
        .where("ranked.rank", "<=", "5")
        .execute(),
      loadCommentImages(db, commentIds, user.id),
    ])
    const commentById = new Map(comments.map((row) => [row.id, row]))
    const viewer = { id: user.id, canModerate: can("comment.delete") }

    return c.ok(
      groups.flatMap((group) => {
        const row = commentById.get(group.commentId)
        const target = targets.get(group.commentId)

        if (row === undefined || target === undefined) {
          return []
        }

        return [
          {
            reportId: group.reportId,
            comment: {
              ...toComment(row, {
                viewer,
                ownerId: target.type === "USER" ? target.id : null,
                images,
              }),
              originalContent: row.content,
              originalImages: images.get(row.id) ?? [],
            },
            target,
            reports: reports
              .filter((report) => report.commentId === group.commentId)
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
