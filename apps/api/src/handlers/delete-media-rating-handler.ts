import { ratingAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getUserContentRatings } from "../utils/content-ratings"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { getRatingSummary, ratingResultSchema, removeRating } from "../utils/ratings"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteMediaRatingHandler = new Hono().delete(
  "/:id/rating",
  describeRoute({
    summary: "Remove my rating of a media",
    description:
      "Removes the score you gave a media. The media stays in your library if it is there.\n\n**Authentication:** signed-in user.",
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
        422: "The provided ID is not a valid UUID.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(ratingAudit.REMOVE),
  withAuth(),
  rateLimit({ prefix: "rate-media", windowMs: 60_000, limit: 30 }),
  withTransaction,
  checkMedia(),
  async (c) => {
    const { db, user, media } = c.var

    if (!(await getUserContentRatings(db, user.id)).includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const previous = await removeRating(db, { userId: user.id, mediaId: media.id })

    if (previous === null) {
      return c.fail("RATING_NOT_FOUND")
    }

    c.var.audit.set({ changes: { before: { score: previous }, after: { score: null } } })

    return c.ok({ mediaId: media.id, score: null, rating: await getRatingSummary(db, media.id) })
  },
)
