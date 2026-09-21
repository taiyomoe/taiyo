import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const unfollowUserHandler = new Hono().delete(
  "/:id/follow",
  describeRoute({
    summary: "Unfollow a user",
    description:
      "Removes the follow edge from you to the given user.\n\n**Authentication:** signed-in user.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "Follow edge removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ followerId: z.uuid(), followingId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists, or you don't follow them.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Follow"),
  checkUser(),
  withTransaction,
  async (c) => {
    const { db, user, targetUser } = c.var
    const result = await db
      .deleteFrom("userFollows")
      .where("followerId", "=", user.id)
      .where("followingId", "=", targetUser.id)
      .executeTakeFirst()

    if (result.numDeletedRows === 0n) {
      return c.fail("NOT_FOLLOWING")
    }

    return c.ok({ followerId: user.id, followingId: targetUser.id })
  },
)
