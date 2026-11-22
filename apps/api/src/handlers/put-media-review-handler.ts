import { reviewAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
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
import { reviewBodySchema, reviewSchema, selectReviews, toReview } from "../utils/reviews"
import { apiSuccessEnvelope } from "../utils/schemas"

const bodySchema = z.object({
  body: reviewBodySchema,
  containsSpoilers: z
    .boolean()
    .default(false)
    .meta({ description: "Whether the review reveals the story. Readers see it collapsed." }),
})

export const putMediaReviewHandler = new Hono().put(
  "/:id/review",
  describeRoute({
    summary: "Review a media",
    description:
      "Writes your review of a media, or replaces the one you wrote. A review needs your score: rate the media first. Reviews are public.\n\n**Authentication:** signed-in user.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "Review saved.",
        content: { "application/json": { schema: resolver(apiSuccessEnvelope(reviewSchema)) } },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists, or your content ratings hide it.",
        409: "You have not rated the media.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
        451: "The media is locked following a copyright notice.",
      }),
    },
  }),
  audited(reviewAudit.SAVE),
  withAuth(),
  rateLimit({ prefix: "review-media", windowMs: 60_000, limit: 10 }),
  validateJson(bodySchema),
  withTransaction,
  checkMedia({ refuseLocked: true }),
  async (c) => {
    const { db, user, media } = c.var
    const { body, containsSpoilers } = c.var.json

    if (!(await getUserContentRatings(db, user.id)).includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const rating = await db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", user.id)
      .where("mediaId", "=", media.id)
      .forShare()
      .executeTakeFirst()

    if (rating === undefined) {
      return c.fail("REVIEW_RATING_REQUIRED")
    }

    const previous = await db
      .selectFrom("mediaReviews")
      .select(["id", "body", "containsSpoilers"])
      .where("userId", "=", user.id)
      .where("mediaId", "=", media.id)
      .where("deletedAt", "is", null)
      .forUpdate()
      .executeTakeFirst()
    const unchanged = previous?.body === body && previous.containsSpoilers === containsSpoilers
    const save = () =>
      previous === undefined
        ? db
            .insertInto("mediaReviews")
            .values({ userId: user.id, mediaId: media.id, body, containsSpoilers })
            .returning("id")
            .executeTakeFirstOrThrow()
        : db
            .updateTable("mediaReviews")
            .set({ body, containsSpoilers, updatedAt: sql<Date>`CURRENT_TIMESTAMP` })
            .where("id", "=", previous.id)
            .returning("id")
            .executeTakeFirstOrThrow()
    const saved = unchanged ? previous : await save()

    c.var.audit.set({
      target: { reviewId: saved.id },
      changes: {
        before:
          previous === undefined
            ? null
            : { length: previous.body.length, containsSpoilers: previous.containsSpoilers },
        after: { length: body.length, containsSpoilers },
      },
    })

    const row = await selectReviews(db, user.id)
      .where("rv.id", "=", saved.id)
      .executeTakeFirstOrThrow()

    return c.ok(toReview(row, { id: user.id, canModerate: false }))
  },
)
