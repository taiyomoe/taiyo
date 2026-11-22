import { reviewReportAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { closeStatusSchema } from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { closeReviewReports } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the report." }) })
const bodySchema = z.object({ status: closeStatusSchema })

export const closeReviewReportHandler = new Hono().patch(
  "/:id",
  describeRoute({
    summary: "Close a review report",
    description:
      "Closes a report as resolved or dismissed, along with every other open report on the same review. Removing the review already resolves its reports.\n\n**Required roles:** moderator, admin.",
    tags: ["Review reports"],
    responses: {
      200: {
        description: "Reports closed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  closed: z
                    .int()
                    .meta({ description: "The number of reports closed.", example: 2 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No review report with the given ID exists.",
        409: "The report is already closed.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(reviewReportAudit.CLOSE),
  withAuth("mediaReview.review"),
  validateParam(paramSchema),
  validateJson(bodySchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const { status } = c.var.json
    const report = await db
      .selectFrom("mediaReviewReports")
      .select(["reviewId", "status"])
      .where("id", "=", id)
      .forUpdate()
      .executeTakeFirst()

    if (report === undefined) {
      return c.fail("REVIEW_REPORT_NOT_FOUND")
    }

    if (report.status !== "OPEN") {
      return c.fail("REVIEW_REPORT_CLOSED")
    }

    const closed = await closeReviewReports(db, {
      reviewIds: [report.reviewId],
      status,
      resolverId: user.id,
    })

    c.var.audit.set({ target: { reviewId: report.reviewId, status } })

    return c.ok({ closed })
  },
)
