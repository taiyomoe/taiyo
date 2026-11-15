import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { demoteGroupMember } from "../group-membership"
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
  userId: z.uuid().meta({ description: "The ID of the owner to demote." }),
})

export const demoteGroupMemberHandler = new Hono().post(
  "/:id/members/:userId/demote",
  describeRoute({
    summary: "Demote a group owner",
    description:
      "Demotes an owner of the group to a regular member, with the permissions stored for them. An owner can only demote themselves, and not as the last owner; an admin can demote any owner. Demoting a member who is not an owner changes nothing.\n\n**Required access:** the group owner, for themselves only, or admin.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Member demoted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of the demoted user." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot demote this member, or your account is banned.",
        404: "No group with the given ID exists, or the user is not a member of the group.",
        409: "The user is the last owner of the group.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(groupMemberAudit.DEMOTE, (c) => ({
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
    const result = await demoteGroupMember(db, { actor, groupId: group.id, userId })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId })
  },
)
