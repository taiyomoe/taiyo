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
  upvoteCount: z.int(),
  viewerVoted: z.boolean(),
})
const responses = (summary: string) => ({
  200: {
    description: summary,
    content: { "application/json": { schema: resolver(apiSuccessEnvelope(voteResultSchema)) } },
  },
  ...getOpenApiResponses({
    404: "The comment doesn't exist or was removed.",
    409: "You can't upvote your own comment.",
    429: "Too many requests — slow down.",
  }),
})

export const voteCommentHandler = new Hono()
  .put(
    "/:id/vote",
    describeRoute({
      summary: "Upvote a comment",
      description:
        "Upvotes a comment. Upvoting twice is a no-op.\n\n**Authentication:** signed-in user.",
      tags: ["Comments"],
      responses: responses("Comment upvoted."),
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
      summary: "Remove an upvote",
      description:
        "Takes back your upvote on a comment. Removing a missing upvote is a no-op.\n\n**Authentication:** signed-in user.",
      tags: ["Comments"],
      responses: responses("Upvote removed."),
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
