import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const leaveGroupHandler = new Hono().post(
  "/:id/leave",
  describeRoute({
    summary: "Leave a group",
    description:
      "Removes your own membership from the group. Refuses if you are the last owner — promote someone else first.\n\n**Authentication:** signed-in user.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Left the group.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ groupId: z.uuid(), userId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists, or you have no membership on the group.",
        409: "Leaving would leave the group without an owner.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const target = await db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", group.id)
      .where("userId", "=", user.id)
      .executeTakeFirst()

    if (!target) {
      return c.fail("GROUP_MEMBER_NOT_FOUND")
    }

    if (target.role === "OWNER") {
      const otherOwners = await db
        .selectFrom("groupMemberships")
        .select("userId")
        .where("groupId", "=", group.id)
        .where("role", "=", "OWNER")
        .where("userId", "!=", user.id)
        .limit(1)
        .executeTakeFirst()

      if (!otherOwners) {
        return c.fail("GROUP_LAST_OWNER")
      }
    }

    await db
      .deleteFrom("groupMemberships")
      .where("groupId", "=", group.id)
      .where("userId", "=", user.id)
      .execute()

    return c.ok({ groupId: group.id, userId: user.id })
  },
)
