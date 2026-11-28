import { ratingAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getUserContentRatings } from "../utils/content-ratings"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { getRatingSummary, ratingResultSchema, setRating } from "../utils/ratings"
import { apiSuccessEnvelope } from "../utils/schemas"

const { minScore, maxScore } = config.ratings
const bodySchema = z.object({
  score: z
    .int()
    .min(minScore)
    .max(maxScore)
    .meta({
      description: `Your score for the media, from ${minScore} to ${maxScore}.`,
      example: 8,
    }),
})

export const putMediaRatingHandler = new Hono().put(
  "/:id/rating",
  describeRoute({
    summary: "Rate a media",
    description: `Sets your score for a media, from ${minScore} to ${maxScore}, or changes the score you gave it. Rating a media does not add it to your library.\n\n**Authentication:** signed-in user.`,
    tags: ["Ratings"],
    responses: {
      200: {
        description: "Score saved.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(ratingResultSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or your content ratings hide it.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
        451: "The media is locked following a copyright notice.",
      }),
    },
  }),
  audited(ratingAudit.SET),
  withAuth(),
  rateLimit({ prefix: "rate-media", windowMs: 60_000, limit: 30 }),
  validateJson(bodySchema),
  withTransaction,
  checkMedia({ refuseLocked: true }),
  async (c) => {
    const { db, user, media } = c.var
    const { score } = c.var.json

    if (!(await getUserContentRatings(db, user.id)).includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const previous = await setRating(db, { userId: user.id, mediaId: media.id, score })

    c.var.audit.set({ changes: { before: { score: previous }, after: { score } } })

    return c.ok({ mediaId: media.id, score, rating: await getRatingSummary(db, media.id) })
  },
)
