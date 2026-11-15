import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeGroupMember } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  userId: z.uuid().meta({ description: "The ID of the member to remove." }),
})

export const removeGroupMemberHandler = new Hono().delete(
  "/:id/members/:userId",
  describeRoute({
    summary: "Remove a member from a group",
    description:
      "Removes a member from the group. The group owner can remove any member who is not an owner; a member with the `MANAGE_MEMBERS` permission can remove members whose permissions they all hold, except managers and themselves. Only an admin can remove an owner, even the last one.\n\n**Required access:** the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Member removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of the removed user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot remove this member, or your account is banned.",
        404: "No group with the given ID exists, or the user is not a member of the group.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(groupMemberAudit.REMOVE, (c) => ({
    id: c.req.param("id"),
    userId: c.req.param("userId"),
  })),
  withAuth(),
  validateParam(paramSchema),
  checkGroup(),
  authorizeGroup("manageMembers"),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const { userId } = c.var.param
    const result = await removeGroupMember(db, { actor, groupId: group.id, userId })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId })
  },
)
