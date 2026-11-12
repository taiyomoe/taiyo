import { listAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkList } from "../middlewares/check-list-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
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
    404: "No PUBLIC list with the given id exists.",
    409: "You can't upvote your own list.",
    429: "Too many requests — slow down.",
  }),
})

export const voteListHandler = new Hono()
  .put(
    "/:id/vote",
    describeRoute({
      summary: "Upvote a list",
      description:
        "Upvotes a PUBLIC list. Upvoting twice is a no-op.\n\n**Authentication:** signed-in user.",
      tags: ["Custom lists"],
      responses: responses("List upvoted."),
    }),
    audited(listAudit.VOTE),
    withAuth(),
    rateLimit({ prefix: "vote-list", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkList(),
    async (c) => {
      const { db, user, list } = c.var

      if (list.userId === user.id) {
        return c.fail("LIST_SELF_VOTE")
      }

      if (list.visibility !== "PUBLIC") {
        return c.fail("LIST_NOT_FOUND")
      }

      const inserted = await db
        .insertInto("userListVotes")
        .values({ listId: list.id, userId: user.id })
        .onConflict((oc) => oc.columns(["listId", "userId"]).doNothing())
        .returning("listId")
        .executeTakeFirst()
      const { upvoteCount } = await db
        .updateTable("userLists")
        .set({ upvoteCount: sql<number>`"upvoteCount" + ${inserted === undefined ? 0 : 1}` })
        .where("id", "=", list.id)
        .returning("upvoteCount")
        .executeTakeFirstOrThrow()

      return c.ok({ upvoteCount, viewerVoted: true })
    },
  )
  .delete(
    "/:id/vote",
    describeRoute({
      summary: "Remove a list upvote",
      description:
        "Takes back your upvote on a list. Removing a missing upvote is a no-op.\n\n**Authentication:** signed-in user.",
      tags: ["Custom lists"],
      responses: responses("Upvote removed."),
    }),
    audited(listAudit.UNVOTE),
    withAuth(),
    rateLimit({ prefix: "vote-list", windowMs: 60_000, limit: 60 }),
    withTransaction,
    checkList(),
    async (c) => {
      const { db, user, list } = c.var
      const removed = await db
        .deleteFrom("userListVotes")
        .where("listId", "=", list.id)
        .where("userId", "=", user.id)
        .returning("listId")
        .executeTakeFirst()
      const { upvoteCount } = await db
        .updateTable("userLists")
        .set({
          upvoteCount: sql<number>`greatest("upvoteCount" - ${removed === undefined ? 0 : 1}, 0)`,
        })
        .where("id", "=", list.id)
        .returning("upvoteCount")
        .executeTakeFirstOrThrow()

      return c.ok({ upvoteCount, viewerVoted: false })
    },
  )
