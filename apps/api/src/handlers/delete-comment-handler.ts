import { commentAudit } from "@taiyomoe/audit"
import { COMMENT_DELETIONS, sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkComment } from "../middlewares/check-comment-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { closeCommentReports } from "../utils/comment-reports"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteCommentHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a comment",
    description:
      "Deletes a comment. A top-level comment with visible replies stays as a placeholder saying who removed it, and its replies stay. Deleting someone else's comment also resolves its open reports, and their reporters are notified.\n\n**Required access:** the author of the comment or the owner of the profile it is on, or moderator or admin.",
    tags: ["Comments"],
    responses: {
      200: {
        description: "Comment deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the comment." }),
                  deletion: z.enum(COMMENT_DELETIONS).meta({
                    description:
                      "Who deleted the comment: its author (`AUTHOR`), the owner of the profile it is on (`PAGE_OWNER`), or a moderator (`MODERATOR`).",
                    example: "AUTHOR",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You do not have permission to delete this comment.",
        404: "No comment with the given ID exists, or it was already removed.",
        422: "The provided ID is not a valid UUID.",
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
      await closeCommentReports(c.var, [comment.id], { status: "RESOLVED" })
    }

    c.var.audit.set({ target: { deletion, authorId: comment.authorId ?? undefined } })

    return c.ok({ id: comment.id, deletion })
  },
)
