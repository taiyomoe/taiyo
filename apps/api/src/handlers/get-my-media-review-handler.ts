import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { reviewSchema, selectReviews, toReview } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMyMediaReviewHandler = new Hono().get(
  "/:id/review",
  describeRoute({
    summary: "Get my review of a media",
    description:
      "Returns the review you wrote of a media, or `null` when you have not reviewed it.\n\n**Authentication:** signed-in user.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "Your review, or null.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(reviewSchema.nullable())),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkMedia(),
  async (c) => {
    const { db, user, media, can } = c.var
    const row = await selectReviews(db, user.id)
      .where("rv.userId", "=", user.id)
      .where("rv.mediaId", "=", media.id)
      .where("rv.deletedAt", "is", null)
      .executeTakeFirst()

    return c.ok(
      row === undefined
        ? null
        : toReview(row, { id: user.id, canModerate: can("mediaReview.delete") }),
    )
  },
)
