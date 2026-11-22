import { reviewAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkReview } from "../middlewares/check-review-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const voteResultSchema = z.object({
  helpfulCount: z
    .int()
    .meta({ description: "How many users found the review helpful.", example: 12 }),
  viewerVoted: z.boolean().meta({ description: "Whether you found the review helpful." }),
})
const voteResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: resolver(apiSuccessEnvelope(voteResultSchema)) } },
})

export const voteReviewHandler = new Hono()
  .put(
    "/:id/vote",
    describeRoute({
      summary: "Mark a review as helpful",
      description:
        "Marks a review as helpful. You cannot mark your own review, and marking a review twice changes nothing.\n\n**Authentication:** signed-in user.",
      tags: ["Reviews"],
      responses: {
        200: voteResponse("Review marked as helpful."),
        ...getOpenApiResponses({
          401: true,
          403: "Your account is banned, or the review is yours.",
          404: "No review with the given ID exists, or it was deleted.",
          422: "The provided ID is not a valid UUID.",
          429: "Too many requests, try again later.",
        }),
      },
    }),
    audited(reviewAudit.VOTE),
    withAuth(),
    rateLimit({ prefix: "vote-review", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkReview(),
    async (c) => {
      const { db, user, review } = c.var

      if (review.userId === user.id) {
        return c.fail("REVIEW_SELF_VOTE")
      }

      const inserted = await db
        .insertInto("mediaReviewVotes")
        .values({ reviewId: review.id, userId: user.id })
        .onConflict((oc) => oc.columns(["userId", "reviewId"]).doNothing())
        .returning("reviewId")
        .executeTakeFirst()
      const { helpfulCount } = await db
        .updateTable("mediaReviews")
        .set({ helpfulCount: sql<number>`"helpfulCount" + ${inserted === undefined ? 0 : 1}` })
        .where("id", "=", review.id)
        .returning("helpfulCount")
        .executeTakeFirstOrThrow()

      return c.ok({ helpfulCount, viewerVoted: true })
    },
  )
  .delete(
    "/:id/vote",
    describeRoute({
      summary: "Unmark a review as helpful",
      description:
        "Takes back your helpful mark on a review. Taking back a mark you did not give changes nothing.\n\n**Authentication:** signed-in user.",
      tags: ["Reviews"],
      responses: {
        200: voteResponse("Helpful mark removed."),
        ...getOpenApiResponses({
          401: true,
          403: true,
          404: "No review with the given ID exists, or it was deleted.",
          422: "The provided ID is not a valid UUID.",
          429: "Too many requests, try again later.",
        }),
      },
    }),
    audited(reviewAudit.UNVOTE),
    withAuth(),
    rateLimit({ prefix: "vote-review", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkReview(),
    async (c) => {
      const { db, user, review } = c.var
      const removed = await db
        .deleteFrom("mediaReviewVotes")
        .where("reviewId", "=", review.id)
        .where("userId", "=", user.id)
        .returning("reviewId")
        .executeTakeFirst()
      const { helpfulCount } = await db
        .updateTable("mediaReviews")
        .set({
          helpfulCount: sql<number>`greatest("helpfulCount" - ${removed === undefined ? 0 : 1}, 0)`,
        })
        .where("id", "=", review.id)
        .returning("helpfulCount")
        .executeTakeFirstOrThrow()

      return c.ok({ helpfulCount, viewerVoted: false })
    },
  )
