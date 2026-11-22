import { reviewAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { closeReviewReports } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the review." }) })

export const removeReviewHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Remove a review",
    description:
      "Removes someone's review as a moderator and resolves its open reports. The author keeps their score and can write a new review.\n\n**Required roles:** moderator, admin.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "Review removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  resolvedReports: z
                    .int()
                    .meta({ description: "The number of open reports resolved.", example: 2 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No review with the given ID exists, or it was already deleted.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(reviewAudit.REMOVE),
  withAuth("mediaReview.delete"),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const removed = await db
      .updateTable("mediaReviews")
      .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deleterId: user.id })
      .where("id", "=", id)
      .where("deletedAt", "is", null)
      .returning(["id", "userId", "mediaId"])
      .executeTakeFirst()

    if (removed === undefined) {
      return c.fail("REVIEW_NOT_FOUND")
    }

    const resolvedReports = await closeReviewReports(db, {
      reviewIds: [removed.id],
      status: "RESOLVED",
      resolverId: user.id,
    })

    c.var.audit.set({ target: { authorId: removed.userId, mediaId: removed.mediaId } })

    return c.ok({ resolvedReports })
  },
)
