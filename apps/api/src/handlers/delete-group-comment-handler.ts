import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), commentId: z.uuid() })

export const deleteGroupCommentHandler = new Hono().delete(
  "/:id/comments/:commentId",
  describeRoute({
    summary: "Delete a comment on a group",
    description:
      "Deletes a comment from the group's page.\n\n**Authentication:** the comment's author, or a moderator or admin.",
    tags: ["Group comments"],
    responses: {
      200: {
        description: "Comment deleted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        403: "You didn't write this comment and can't moderate comments.",
        404: "No comment with the given id exists on this group.",
        422: "The provided ids are not valid UUIDs.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { can, db, user } = c.var
    const { id, commentId } = c.var.param
    const comment = await db
      .selectFrom("groupComments")
      .select(["id", "userId"])
      .where("id", "=", commentId)
      .where("groupId", "=", id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (comment === undefined) {
      return c.fail("GROUP_COMMENT_NOT_FOUND")
    }

    if (comment.userId !== user.id && !can("comment.delete")) {
      return c.fail("FORBIDDEN")
    }

    await db
      .updateTable("groupComments")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", comment.id)
      .execute()

    return c.ok({ id: comment.id })
  },
)
