import { commentAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { recordActivity } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const voteResultSchema = z.object({
  upvoteCount: z.int().meta({ description: "The number of upvotes on the comment.", example: 12 }),
  viewerVoted: z.boolean().meta({ description: "Whether you upvoted the comment." }),
})
const voteResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: resolver(apiSuccessEnvelope(voteResultSchema)) } },
})

export const voteCommentHandler = new Hono()
  .put(
    "/:id/vote",
    describeRoute({
      summary: "Upvote a comment",
      description:
        "Upvotes a comment. You cannot upvote your own comment, and upvoting a comment twice changes nothing.\n\n**Authentication:** signed-in user.",
      tags: ["Comments"],
      responses: {
        200: voteResponse("Comment upvoted."),
        ...getOpenApiResponses({
          401: true,
          403: "Your account is banned, or you are trying to upvote your own comment.",
          404: "No comment with the given ID exists, or it was removed.",
          422: "The provided ID is not a valid UUID.",
          429: "Too many requests, try again later.",
        }),
      },
    }),
    audited(commentAudit.VOTE),
    withAuth(),
    rateLimit({ prefix: "vote-comment", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkComment({ live: true }),
    async (c) => {
      const { db, user, comment, afterCommit, notificationEvents } = c.var
      const { authorId } = comment

      if (authorId === user.id) {
        return c.fail("COMMENT_SELF_VOTE")
      }

      const inserted = await db
        .insertInto("commentVotes")
        .values({ commentId: comment.id, userId: user.id })
        .onConflict((oc) => oc.columns(["commentId", "userId"]).doNothing())
        .returning("commentId")
        .executeTakeFirst()
      const { upvoteCount } = await db
        .updateTable("comments")
        .set({ upvoteCount: sql<number>`"upvoteCount" + ${inserted === undefined ? 0 : 1}` })
        .where("id", "=", comment.id)
        .returning("upvoteCount")
        .executeTakeFirstOrThrow()

      if (
        inserted !== undefined &&
        authorId !== null &&
        (await recordActivity(db, {
          type: "COMMENT_LIKE",
          recipientId: authorId,
          actorId: user.id,
          commentId: comment.id,
        }))
      ) {
        afterCommit(() => notificationEvents.publish([authorId]))
      }

      return c.ok({ upvoteCount, viewerVoted: true })
    },
  )
  .delete(
    "/:id/vote",
    describeRoute({
      summary: "Remove a comment upvote",
      description:
        "Removes your upvote from a comment. Removing an upvote you did not give changes nothing.\n\n**Authentication:** signed-in user.",
      tags: ["Comments"],
      responses: {
        200: voteResponse("Upvote removed."),
        ...getOpenApiResponses({
          401: true,
          403: true,
          404: "No comment with the given ID exists.",
          422: "The provided ID is not a valid UUID.",
          429: "Too many requests, try again later.",
        }),
      },
    }),
    audited(commentAudit.UNVOTE),
    withAuth(),
    rateLimit({ prefix: "vote-comment", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkComment(),
    async (c) => {
      const { db, user, comment } = c.var
      const removed = await db
        .deleteFrom("commentVotes")
        .where("commentId", "=", comment.id)
        .where("userId", "=", user.id)
        .returning("commentId")
        .executeTakeFirst()
      const { upvoteCount } = await db
        .updateTable("comments")
        .set({
          upvoteCount: sql<number>`greatest("upvoteCount" - ${removed === undefined ? 0 : 1}, 0)`,
        })
        .where("id", "=", comment.id)
        .returning("upvoteCount")
        .executeTakeFirstOrThrow()

      return c.ok({ upvoteCount, viewerVoted: false })
    },
  )
