import { reviewReportAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { COMMENT_REPORT_REASONS } from "@taiyomoe/db"
import { sanitizeUserText } from "@taiyomoe/schemas/comment-content"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkReview } from "../middlewares/check-review-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  reason: z.enum(COMMENT_REPORT_REASONS).meta({
    description: "Why the review should be removed.",
    example: "SPOILER",
  }),
  details: z
    .string()
    .transform(sanitizeUserText)
    .pipe(z.string().trim().max(config.reviews.maxReportDetailsLength))
    .optional()
    .transform((value) => (value === "" ? undefined : value))
    .meta({
      description: `Anything the moderators should know, up to ${config.reviews.maxReportDetailsLength} characters.`,
      example: "Reveals the ending without the spoiler flag.",
    }),
})

export const createReviewReportHandler = new Hono().post(
  "/:id/reports",
  describeRoute({
    summary: "Report a review",
    description:
      "Reports a review to the moderators. You can have one open report per review, and you cannot report your own.\n\n**Authentication:** signed-in user.",
    tags: ["Review reports"],
    responses: {
      201: {
        description: "Report created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the report." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot report your own review, or you do not have permission to perform this action.",
        404: "No review with the given ID exists, or it was deleted.",
        409: "You already have an open report on this review.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(reviewReportAudit.CREATE),
  withAuth(),
  rateLimit({ prefix: "review-report", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  withTransaction,
  checkReview(),
  async (c) => {
    const { db, user, review } = c.var
    const { reason, details } = c.var.json

    if (review.userId === user.id) {
      return c.fail("FORBIDDEN")
    }

    const report = await db
      .insertInto("mediaReviewReports")
      .values({ reviewId: review.id, reporterId: user.id, reason, details: details ?? null })
      .onConflict((oc) =>
        oc.columns(["reporterId", "reviewId"]).where("status", "=", "OPEN").doNothing(),
      )
      .returning("id")
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("REVIEW_REPORT_EXISTS")
    }

    c.var.audit.set({ target: { reportId: report.id, reason } })

    return c.ok(report)
  },
)
