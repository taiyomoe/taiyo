import { createMiddleware } from "hono/factory"
import z from "zod"
import { withRequestSpec } from "../utils/openapi-helper"
import { liveReviewSql } from "../utils/reviews"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the review." }),
})

/** Loads the review in `:id`; a deleted one, one by a banned user, or one of a deleted media is not found. */
export const checkReview = () =>
  withRequestSpec(
    createMiddleware<{
      Variables: { review: { id: string; userId: string; mediaId: string } }
    }>(async (c, next) => {
      const parsed = paramSchema.safeParse({ id: c.req.param("id") })

      if (!parsed.success) {
        return c.fail("VALIDATION_ERROR", parsed.error.issues)
      }

      const { db, log } = c.var

      log.set({ review: { id: parsed.data.id } })

      const review = await db
        .selectFrom("mediaReviews as rv")
        .innerJoin("users as u", "u.id", "rv.userId")
        .innerJoin("medias as m", "m.id", "rv.mediaId")
        .select(["rv.id", "rv.userId", "rv.mediaId"])
        .where("rv.id", "=", parsed.data.id)
        .where(liveReviewSql("rv", "u"))
        .where("m.deletedAt", "is", null)
        .executeTakeFirst()

      if (review === undefined) {
        return c.fail("REVIEW_NOT_FOUND")
      }

      c.set("review", review)

      return next()
    }),
    "param",
    paramSchema,
  )
