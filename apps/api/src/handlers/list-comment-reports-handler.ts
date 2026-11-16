import {
  COMMENT_REPORT_REASONS,
  COMMENT_REPORT_STATUSES,
  COMMENT_TARGET_TYPES,
  sql,
} from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import {
  commentReportSchema,
  selectCommentReports,
  toCommentReport,
} from "../utils/comment-reports"
import {
  commentSchema,
  getCommentTargets,
  labelledCommentTargetSchema,
  loadCommentImages,
  selectComments,
  THREAD_COLUMNS,
  toComment,
} from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, userSummarySchema } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(COMMENT_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "The status of the reports to list.", example: "OPEN" }),
  reason: z.enum(COMMENT_REPORT_REASONS).optional().meta({
    description: "Only list the comments with at least one report for this reason.",
    example: "SPOILER",
  }),
  target: z.enum(COMMENT_TARGET_TYPES).optional().meta({
    description: "Only list the comments on this type of resource.",
    example: "CHAPTER",
  }),
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
      originalAuthor: userSummarySchema.nullable().meta({
        description:
          "The author of the comment, kept even after it was removed, or `null` once they deleted their account.",
      }),
    })
    .meta({ description: "The reported comment." }),
  target: labelledCommentTargetSchema.meta({ description: "The resource the comment is on." }),
  reports: commentReportSchema.array().meta({
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
    const { page, perPage, status, reason, target: targetType } = c.var.query
    const grouped = db
      .selectFrom("commentReports as r")
      .innerJoin("comments as c", "c.id", "r.commentId")
      .innerJoin("commentThreads as t", "t.id", "c.threadId")
      .select([
        "r.commentId",
        sql<string>`count(*)`.as("reportCount"),
        sql<Date>`min("r"."createdAt")`.as("firstAt"),
        sql<Date>`max(coalesce("r"."resolvedAt", "r"."createdAt"))`.as("lastAt"),
        sql<string>`(array_agg("r"."id" order by "r"."createdAt" desc))[1]`.as("reportId"),
      ])
      .where("r.status", "=", status)
      .where((eb) =>
        targetType === undefined
          ? eb.and([])
          : eb(`t.${THREAD_COLUMNS[targetType]}`, "is not", null),
      )
      .groupBy("r.commentId")
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
          selectCommentReports(db)
            .select(
              sql<string>`row_number() over (partition by "r"."commentId" order by "r"."createdAt" desc)`.as(
                "rank",
              ),
            )
            .where("r.commentId", "in", commentIds)
            .where("r.status", "=", status)
            .as("ranked"),
        )
        .selectAll()
        .where("ranked.rank", "<=", "5")
        .orderBy("ranked.createdAt", "desc")
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
              originalAuthor:
                row.authorId === null
                  ? null
                  : {
                      id: row.authorId,
                      username: row.authorUsername ?? "",
                      displayUsername: row.authorDisplayUsername ?? "",
                      image: row.authorImage ?? null,
                      nameEffect: row.authorNameEffect ?? null,
                      avatarBorder: row.authorAvatarBorder ?? null,
                    },
            },
            target,
            reports: reports
              .filter((report) => report.commentId === group.commentId)
              .map(toCommentReport),
            reportCount: Number(group.reportCount),
          },
        ]
      }),
      { page, perPage, total: Number(totalRow.count) },
    )
  },
)
