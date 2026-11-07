import { profileCommentAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), commentId: z.uuid() })

export const deleteProfileCommentHandler = new Hono().delete(
  "/:id/comments/:commentId",
  describeRoute({
    summary: "Delete a profile comment",
    description:
      "Deletes a comment from a profile. Its author, the profile owner and moderators may delete it.\n\n**Authentication:** signed-in user.",
    tags: ["Profile comments"],
    responses: {
      200: {
        description: "Comment deleted.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        403: "You may not delete this comment.",
        404: "No such comment exists on this profile.",
        422: "An id is not a valid UUID.",
      }),
    },
  }),
  audited(profileCommentAudit.DELETE),
  withAuth(),
  validateParam(paramSchema),
  checkUser({ includeBanned: true }),
  async (c) => {
    const { db, user, targetUser, can } = c.var
    const { commentId } = c.var.param

    c.var.audit.set({ target: { commentId } })

    const comment = await db
      .selectFrom("userProfileComments")
      .select(["id", "authorId", "content"])
      .where("id", "=", commentId)
      .where("profileId", "=", targetUser.id)
      .where("deletedAt", "is", null)
      .executeTakeFirst()

    if (!comment) {
      return c.fail("PROFILE_COMMENT_NOT_FOUND")
    }

    if (comment.authorId !== user.id && targetUser.id !== user.id && !can("comment.delete")) {
      return c.fail("FORBIDDEN")
    }

    await db
      .updateTable("userProfileComments")
      .set({ deletedAt: new Date() })
      .where("id", "=", comment.id)
      .execute()

    return c.ok({ id: comment.id })
  },
)
