import { ratingAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getUserContentRatings } from "../utils/content-ratings"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { getRatingSummary, ratingResultSchema, removeRating } from "../utils/ratings"
import { deleteOwnReview } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  withReview: z.stringbool().default(false).meta({
    description:
      "Whether to delete your review of the media along with the score. Without it, a media you reviewed keeps your score.",
    example: true,
  }),
})

export const deleteMediaRatingHandler = new Hono().delete(
  "/:id/rating",
  describeRoute({
    summary: "Remove my rating of a media",
    description:
      "Removes the score you gave a media. The media stays in your library if it is there. A review needs its score, so removing the score of a media you reviewed fails unless `withReview` deletes the review too.\n\n**Authentication:** signed-in user.",
    tags: ["Ratings"],
    responses: {
      200: {
        description: "Score removed.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(ratingResultSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, your content ratings hide it, or you have not rated it.",
        409: "You reviewed the media, and `withReview` is not set.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(ratingAudit.REMOVE),
  withAuth(),
  rateLimit({ prefix: "rate-media", windowMs: 60_000, limit: 30 }),
  validateQuery(querySchema),
  withTransaction,
  checkMedia(),
  async (c) => {
    const { db, user, media } = c.var

    if (!(await getUserContentRatings(db, user.id)).includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const rated = await db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", user.id)
      .where("mediaId", "=", media.id)
      .forUpdate()
      .executeTakeFirst()

    if (rated === undefined) {
      return c.fail("RATING_NOT_FOUND")
    }

    const review = c.var.query.withReview
      ? await deleteOwnReview(db, { userId: user.id, mediaId: media.id })
      : await db
          .selectFrom("mediaReviews")
          .select("id")
          .where("userId", "=", user.id)
          .where("mediaId", "=", media.id)
          .where("deletedAt", "is", null)
          .executeTakeFirst()

    if (!c.var.query.withReview && review !== undefined) {
      return c.fail("RATING_HAS_REVIEW")
    }

    const previous = await removeRating(db, { userId: user.id, mediaId: media.id })

    c.var.audit.set({
      changes: {
        before: { score: previous, reviewId: review?.id ?? null },
        after: { score: null, reviewId: null },
      },
    })

    return c.ok({ mediaId: media.id, score: null, rating: await getRatingSummary(db, media.id) })
  },
)
