import { userAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const unfollowUserHandler = new Hono().delete(
  "/:id/follow",
  describeRoute({
    summary: "Unfollow a user",
    description: "Unfollows a user.\n\n**Authentication:** signed-in user.",
    tags: ["Follows"],
    responses: {
      200: {
        description: "User unfollowed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  followerId: z.uuid().meta({ description: "Your ID." }),
                  followingId: z.uuid().meta({ description: "The ID of the unfollowed user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No user with the given ID exists, the user is banned, or you do not follow the user.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(userAudit.UNFOLLOW),
  withAuth(),
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
