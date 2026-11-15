import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { leaveGroup } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
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
      "Leaves the group, ending your membership. The last owner cannot leave: promote another member to owner first.\n\n**Required access:** a member of the group.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Group left.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of your user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists, or you are not a member of the group.",
        409: "You are the last owner of the group.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupMemberAudit.LEAVE),
  withAuth(),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const result = await leaveGroup(db, { groupId: group.id, userId: user.id })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId: user.id })
  },
)
