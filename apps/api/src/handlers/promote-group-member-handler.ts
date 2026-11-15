import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { promoteGroupMember } from "../group-membership"
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
  userId: z.uuid().meta({ description: "The ID of the member to promote." }),
})

export const promoteGroupMemberHandler = new Hono().post(
  "/:id/members/:userId/promote",
  describeRoute({
    summary: "Promote a member to owner",
    description:
      "Promotes a member of the group to owner. Their stored permissions are kept and apply again if they are demoted later. Promoting an owner changes nothing.\n\n**Required access:** the group owner, or admin.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Member promoted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of the promoted user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not an owner of the group, or your account is banned.",
        404: "No group with the given ID exists, or the user is not a member of the group.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(groupMemberAudit.PROMOTE, (c) => ({
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
    const result = await promoteGroupMember(db, { actor, groupId: group.id, userId })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId })
  },
)
