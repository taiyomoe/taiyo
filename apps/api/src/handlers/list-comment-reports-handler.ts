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
  commentSchema,
  loadCommentImages,
  selectComments,
  THREAD_COLUMNS,
  toComment,
} from "../utils/comments"
import { getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = paginationQuerySchema.extend({
  status: z
    .enum(COMMENT_REPORT_STATUSES)
    .default("OPEN")
    .meta({ description: "Which reports to list.", example: "OPEN" }),
})
const reportSchema = z.object({
  id: z.uuid(),
  reason: z.enum(COMMENT_REPORT_REASONS),
  details: z.string().nullable(),
  createdAt: z.iso.datetime(),
  reporter: z.object({ id: z.uuid(), username: z.string(), displayUsername: z.string() }),
})
const reportedCommentSchema = z.object({
  reportId: z.uuid().meta({ description: "The report to close; closing it closes its siblings." }),
  comment: commentSchema.extend({
    originalContent: z
      .string()
      .meta({ description: "The comment's text, kept even after it was removed." }),
    originalImages: commentSchema.shape.images,
  }),
  target: z.object({
    type: z.enum(COMMENT_TARGET_TYPES),
    id: z.uuid(),
    label: z.string().nullable(),
    username: z.string().nullable().meta({ description: "The profile's username, for links." }),
  }),
  reports: reportSchema.array().meta({ description: "The latest reports, up to 5." }),
  reportCount: z.int(),
})

export const listCommentReportsHandler = new Hono().get(
  "/",
  describeRoute({
    summary: "List comment reports",
    description:
      "Lists reported comments, one entry per comment. Open reports come oldest first, closed ones newest first.\n\n**Required roles:** moderator, admin.",
    tags: ["Comment reports"],
    responses: {
      200: {
        description: "Reported comments.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(reportedCommentSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
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

    const [comments, threads, reports, images] = await Promise.all([
      selectComments(db, user.id).where("c.id", "in", commentIds).execute(),
      db
        .selectFrom("comments as c")
        .innerJoin("commentThreads as t", "t.id", "c.threadId")
        .leftJoin("chapters as ch", "ch.id", "t.chapterId")
        .leftJoin("groups as g", "g.id", "t.groupId")
        .leftJoin("users as pu", "pu.id", "t.profileId")
        .select([
          "c.id",
          "t.mediaId",
          "t.chapterId",
          "t.groupId",
          "t.profileId",
          "ch.mediaId as chapterMediaId",
          "ch.number as chapterNumber",
          "g.name as groupName",
          "pu.username as profileUsername",
          "pu.displayUsername as profileDisplayUsername",
        ])
        .where("c.id", "in", commentIds)
        .execute(),
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
    const titles = await getMainTitles(db, [
      ...new Set(
        threads
          .flatMap((thread) => [thread.mediaId, thread.chapterMediaId])
          .filter((id) => id !== null),
      ),
    ])
    const commentById = new Map(comments.map((row) => [row.id, row]))
    const threadById = new Map(threads.map((row) => [row.id, row]))
    const viewer = { id: user.id, canModerate: can("comment.delete") }

    return c.ok(
      groups.flatMap((group) => {
        const row = commentById.get(group.commentId)
        const thread = threadById.get(group.commentId)

        if (row === undefined || thread === undefined) {
          return []
        }

        const type =
          COMMENT_TARGET_TYPES.find((key) => thread[THREAD_COLUMNS[key]] !== null) ?? "MEDIA"
        let label: string | null = null

        if (type === "MEDIA") {
          label = titles.get(thread.mediaId ?? "") ?? null
        } else if (type === "CHAPTER") {
          const title = titles.get(thread.chapterMediaId ?? "") ?? null

          label = `${title ?? "?"} · #${thread.chapterNumber ?? "?"}`
        } else if (type === "GROUP") {
          label = thread.groupName
        } else {
          label = thread.profileDisplayUsername
        }

        return [
          {
            reportId: group.reportId,
            comment: {
              ...toComment(row, { viewer, ownerId: thread.profileId, images }),
              originalContent: row.content,
              originalImages: images.get(row.id) ?? [],
            },
            target: {
              type,
              id: thread[THREAD_COLUMNS[type]] ?? "",
              label,
              username: thread.profileUsername,
            },
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
