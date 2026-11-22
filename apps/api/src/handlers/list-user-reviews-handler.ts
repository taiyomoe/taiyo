import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { cursorQuerySchema, nextCursorMetaSchema } from "../utils/comments"
import { getMainCoverUrls, getMainTitles } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  decodeReviewCursor,
  encodeReviewCursor,
  reviewSchema,
  reviewsAfter,
  selectReviews,
  toReview,
} from "../utils/reviews"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema.meta({
    description:
      "Comma-separated content ratings you allow. Reviews of medias outside them are left out. Defaults to the default user setting.",
  }),
  cursor: cursorQuerySchema,
  limit: z.coerce.number().int().min(1).max(50).default(config.reviews.perPage).meta({
    description: "The number of reviews to return, from 1 to 50.",
    example: 10,
  }),
})
const userReviewSchema = reviewSchema.extend({
  media: z
    .object({
      title: z.string().nullable().meta({ description: "The main title of the media, if any." }),
      coverUrl: z
        .string()
        .nullable()
        .meta({ description: "The URL of the main cover of the media, if any." }),
    })
    .meta({ description: "The reviewed media." }),
})

export const listUserReviewsHandler = new Hono().get(
  "/:id/reviews",
  describeRoute({
    summary: "List a user's reviews",
    description:
      "Lists the reviews a user wrote, newest first, with the media each one is about. Reviews of deleted medias are left out.\n\n**Authentication:** optional.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "The reviews of the user.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(userReviewSchema.array(), nextCursorMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given ID exists, or the user is banned.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkUser(),
  withOptionalAuth,
  async (c) => {
    const { db, targetUser, viewer, can } = c.var
    const { contentRating, cursor, limit } = c.var.query
    const after = decodeReviewCursor(cursor)
    const reviews = selectReviews(db, viewer?.id ?? null)
      .innerJoin("medias as m", "m.id", "rv.mediaId")
      .where("rv.userId", "=", targetUser.id)
      .where("rv.deletedAt", "is", null)
      .where("m.deletedAt", "is", null)
      .where("m.contentRating", "in", contentRating)
    const rows = await (after === null ? reviews : reviews.where(reviewsAfter("newest", after)))
      .orderBy("rv.createdAt", "desc")
      .orderBy("rv.id", "desc")
      .limit(limit + 1)
      .execute()
    const shown = rows.slice(0, limit)
    const mediaIds = [...new Set(shown.map((row) => row.mediaId))]
    const [titles, covers] = await Promise.all([
      getMainTitles(db, mediaIds),
      getMainCoverUrls(db, mediaIds),
    ])
    const last = shown.at(-1)
    const reviewer =
      viewer === null ? null : { id: viewer.id, canModerate: can("mediaReview.delete") }

    return c.ok(
      shown.map((row) => ({
        ...toReview(row, reviewer),
        media: {
          title: titles.get(row.mediaId) ?? null,
          coverUrl: covers.get(row.mediaId) ?? null,
        },
      })),
      {
        nextCursor:
          rows.length > limit && last !== undefined ? encodeReviewCursor(last, "newest") : null,
      },
    )
  },
)
