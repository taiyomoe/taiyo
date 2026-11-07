import { commentAudit } from "@taiyomoe/audit"
import { COMMENT_DELETIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteCommentHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a comment",
    description:
      "Deletes a comment. Its author, the owner of the profile it was left on, and moderators may delete it. A top-level comment with replies stays as a placeholder saying who removed it; its replies stay.\n\n**Authentication:** signed-in user.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid(),
                  deletion: z.enum(COMMENT_DELETIONS),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        403: "You may not delete this comment.",
        404: "The comment doesn't exist or was already removed.",
      }),
    },
  }),
  audited(commentAudit.DELETE),
  withAuth(),
  withTransaction,
  checkComment({ live: true }),
  async (c) => {
    const { db, user, can, comment } = c.var
    let deletion: (typeof COMMENT_DELETIONS)[number]

    if (comment.authorId === user.id) {
      deletion = "AUTHOR"
    } else if (comment.ownerId === user.id) {
      deletion = "PAGE_OWNER"
    } else if (can("comment.delete")) {
      deletion = "MODERATOR"
    } else {
      return c.fail("FORBIDDEN")
    }

    const deleted = await db
      .updateTable("comments")
      .set({ deletedAt: sql<Date>`CURRENT_TIMESTAMP`, deletion, deleterId: user.id })
      .where("id", "=", comment.id)
      .where("deletedAt", "is", null)
      .returning("id")
      .executeTakeFirst()

    if (deleted === undefined) {
      return c.fail("COMMENT_NOT_FOUND")
    }

    if (deletion !== "AUTHOR") {
      await db
        .updateTable("commentReports")
        .set({ status: "RESOLVED", resolverId: user.id, resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
        .where("commentId", "=", comment.id)
        .where("status", "=", "OPEN")
        .execute()
    }

    c.var.audit.set({ target: { deletion, authorId: comment.authorId ?? undefined } })

    return c.ok({ id: comment.id, deletion })
  },
)
