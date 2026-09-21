import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const followUserHandler = new Hono().post(
  "/:id/follow",
  describeRoute({
    summary: "Follow a user",
    description:
      "Creates a follow edge from you to the given user.\n\n**Authentication:** signed-in user.",
    tags: ["Follows"],
    responses: {
      201: {
        description: "Follow edge created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ followerId: z.uuid(), followingId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        409: "You can't follow yourself, or you already follow this user.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("create", "Follow"),
  checkUser(),
  withTransaction,
  async (c) => {
    const { db, user, targetUser } = c.var

    if (user.id === targetUser.id) {
      return c.fail("FOLLOW_SELF")
    }

    const existing = await db
      .selectFrom("userFollows")
      .select("followerId")
      .where("followerId", "=", user.id)
      .where("followingId", "=", targetUser.id)
      .executeTakeFirst()

    if (existing) {
      return c.fail("ALREADY_FOLLOWING")
    }

    await db
      .insertInto("userFollows")
      .values({ followerId: user.id, followingId: targetUser.id })
      .execute()

    return c.ok({ followerId: user.id, followingId: targetUser.id })
  },
)
