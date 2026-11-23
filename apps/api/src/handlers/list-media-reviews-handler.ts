import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { cursorQuerySchema, nextCursorMetaSchema } from "../utils/comments"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  decodeReviewCursor,
  encodeReviewCursor,
  liveReviewSql,
  REVIEW_SORT_KEYS,
  REVIEW_SORTS,
  reviewSchema,
  reviewsAfter,
  selectReviews,
  toReview,
} from "../utils/reviews"
import { apiSuccessEnvelope, contentRatingsQuerySchema } from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema.meta({
    description:
      "Comma-separated content ratings you allow. A media outside them is not found. Defaults to the default user setting.",
  }),
  sort: z.enum(REVIEW_SORTS).default("helpful").meta({
    description:
      "The order of the reviews: `helpful` for most found helpful, `newest`, `highest` or `lowest` score first. Ties go newest first.",
    example: "newest",
  }),
  cursor: cursorQuerySchema,
  limit: z.coerce.number().int().min(1).max(50).default(config.reviews.perPage).meta({
    description: "The number of reviews to return, from 1 to 50.",
    example: 10,
  }),
})

export const listMediaReviewsHandler = new Hono().get(
  "/:id/reviews",
  describeRoute({
    summary: "List a media's reviews",
    description:
      "Lists the reviews of a media in the order given by `sort`, each with its author's score. Reviews by banned users are left out. Signed-in viewers also see which reviews they found helpful and what they can do with each.\n\n**Authentication:** optional.",
    tags: ["Reviews"],
    responses: {
      200: {
        description: "The reviews of the media.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                reviewSchema.array(),
                nextCursorMetaSchema.extend({
                  total: z
                    .int()
                    .meta({ description: "The number of reviews of the media.", example: 14 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists, or it is outside the content ratings.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  withOptionalAuth,
  async (c) => {
    const { db, media, viewer, can } = c.var
    const { contentRating, sort, cursor, limit } = c.var.query

    if (!contentRating.includes(media.contentRating)) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const live = selectReviews(db, viewer?.id ?? null)
      .where("rv.mediaId", "=", media.id)
      .where(liveReviewSql("rv", "u"))
      .where("mr.score", "is not", null)
    const after = decodeReviewCursor(cursor)
    const key = REVIEW_SORT_KEYS[sort]
    let page = after === null ? live : live.where(reviewsAfter(sort, after))

    if (key !== null) {
      page = page.orderBy(key, sort === "lowest" ? "asc" : "desc")
    }

    const [rows, totalRow] = await Promise.all([
      page
        .orderBy("rv.createdAt", "desc")
        .orderBy("rv.id", "desc")
        .limit(limit + 1)
        .execute(),
      db
        .selectFrom("mediaReviews as rv")
        .innerJoin("users as u", "u.id", "rv.userId")
        .innerJoin("mediaRatings as mr", (join) =>
          join.onRef("mr.userId", "=", "rv.userId").onRef("mr.mediaId", "=", "rv.mediaId"),
        )
        .where("rv.mediaId", "=", media.id)
        .where(liveReviewSql("rv", "u"))
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .executeTakeFirstOrThrow(),
    ])
    const shown = rows.slice(0, limit)
    const last = shown.at(-1)
    const reviewer =
      viewer === null ? null : { id: viewer.id, canModerate: can("mediaReview.delete") }

    return c.ok(
      shown.map((row) => toReview(row, reviewer)),
      {
        nextCursor:
          rows.length > limit && last !== undefined ? encodeReviewCursor(last, sort) : null,
        total: Number(totalRow.count),
      },
    )
  },
)
