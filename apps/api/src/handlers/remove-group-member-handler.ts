import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeGroupMember } from "../group-membership"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), userId: z.uuid() })

export const removeGroupMemberHandler = new Hono().delete(
  "/:id/members/:userId",
  describeRoute({
    summary: "Remove a member from a group",
    description:
      "Removes a member from the group. Owners can remove members, and members with `MANAGE_MEMBERS` can remove members whose permissions they all hold, except other managers. Nobody but an admin can remove an owner, and only admins can remove the last one. Use leave to remove yourself.\n\n**Authentication:** group owner, member with `MANAGE_MEMBERS`, admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Member removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ groupId: z.uuid(), userId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists, or the user has no membership on the group.",
        409: "Removing this user would leave the group without an owner.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
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
