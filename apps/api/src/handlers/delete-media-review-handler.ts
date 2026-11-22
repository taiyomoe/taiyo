import { reviewAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { deleteOwnReview } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteMediaReviewHandler = new Hono().delete(
  "/:id/review",
  describeRoute({
    summary: "Delete my review of a media",
    description:
      "Deletes the review you wrote of a media. Your score stays.\n\n**Authentication:** signed-in user.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "Review deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the deleted review." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or you have not reviewed it.",
        422: "The provided ID is not a valid UUID.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(reviewAudit.DELETE),
  withAuth(),
  rateLimit({ prefix: "review-media", windowMs: 60_000, limit: 10 }),
  withTransaction,
  checkMedia(),
  async (c) => {
    const { db, user, media } = c.var
    const deleted = await deleteOwnReview(db, { userId: user.id, mediaId: media.id })

    if (deleted === undefined) {
      return c.fail("REVIEW_NOT_FOUND")
    }

    c.var.audit.set({ target: { reviewId: deleted.id } })

    return c.ok(deleted)
  },
)
