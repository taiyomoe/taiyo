import { commentReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { COMMENT_REPORT_REASONS } from "@taiyomoe/db"
import { sanitizeUserText } from "@taiyomoe/schemas/comment-content"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  reason: z.enum(COMMENT_REPORT_REASONS).meta({
    description: "Why the comment should be removed.",
    example: "SPAM",
  }),
  details: z
    .string()
    .transform(sanitizeUserText)
    .pipe(z.string().trim().max(config.comments.maxReportDetailsLength))
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .meta({ description: "Anything moderators should know, up to 500 characters." }),
})

export const createCommentReportHandler = new Hono().post(
  "/:id/reports",
  describeRoute({
    summary: "Report a comment",
    description:
      "Reports a comment to the moderators. You can have one open report per comment, and can't report your own.\n\n**Authentication:** signed-in user.",
    tags: ["Comment reports"],
    requestBody: {
      content: { "application/json": await resolver(bodySchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Report created.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        403: "You can't report your own comment.",
        404: "The comment doesn't exist or was removed.",
        409: "You already have an open report on this comment.",
        422: "The request data failed validation.",
        429: "You sent too many reports in a short time.",
      }),
    },
  }),
  audited(commentReportAudit.CREATE),
  withAuth(),
  rateLimit({ prefix: "comment-report", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  withTransaction,
  checkComment({ live: true }),
  async (c) => {
    const { db, user, comment } = c.var
    const { reason, details } = c.var.json

    if (comment.authorId === user.id) {
      return c.fail("FORBIDDEN")
    }

    const report = await db
      .insertInto("commentReports")
      .values({ commentId: comment.id, reporterId: user.id, reason, details: details ?? null })
      .onConflict((oc) =>
        oc.columns(["reporterId", "commentId"]).where("status", "=", "OPEN").doNothing(),
      )
      .returning("id")
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("COMMENT_REPORT_EXISTS")
    }

    c.var.audit.set({ target: { reportId: report.id, reason } })

    return c.ok(report)
  },
)
