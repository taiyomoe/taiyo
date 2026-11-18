import { userAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { awardAchievements } from "../utils/achievements"
import { recordActivity } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const followUserHandler = new Hono().post(
  "/:id/follow",
  describeRoute({
    summary: "Follow a user",
    description: "Follows the user with the given ID.\n\n**Authentication:** signed-in user.",
    tags: ["Follows"],
    responses: {
      201: {
        description: "User followed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  followerId: z.uuid().meta({ description: "Your ID." }),
                  followingId: z.uuid().meta({ description: "The ID of the followed user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No user with the given ID exists, or the user is banned.",
        409: "The user is you, or you already follow this user.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(userAudit.FOLLOW),
  withAuth(),
  checkUser(),
  withTransaction,
  async (c) => {
    const { db, user, targetUser, afterCommit, notificationEvents } = c.var

    if (user.id === targetUser.id) {
      return c.fail("FOLLOW_SELF")
    }

    const inserted = await db
      .insertInto("userFollows")
      .values({ followerId: user.id, followingId: targetUser.id })
      .onConflict((oc) => oc.doNothing())
      .returning("followerId")
      .executeTakeFirst()

    if (!inserted) {
      return c.fail("ALREADY_FOLLOWING")
    }

    if (
      await recordActivity(db, { type: "FOLLOW", recipientId: targetUser.id, actorId: user.id })
    ) {
      afterCommit(() => notificationEvents.publish([targetUser.id]))
    }

    await awardAchievements(c.var, targetUser.id)

    return c.ok({ followerId: user.id, followingId: targetUser.id })
  },
)
