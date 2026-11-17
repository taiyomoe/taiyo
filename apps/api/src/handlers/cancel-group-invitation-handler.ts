import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { cancelGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  invitationId: z.uuid().meta({ description: "The ID of the invitation." }),
})

export const cancelGroupInvitationHandler = new Hono().delete(
  "/:id/invitations/:invitationId",
  describeRoute({
    summary: "Cancel a group invitation",
    description:
      "Cancels a pending invitation to the group. The member who sent it can always cancel it; anyone else must be allowed to send the same invitation themselves.\n\n**Required access:** the inviter, the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Invitation cancelled.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the invitation." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You did not send the invitation and cannot send it yourself, or your account is banned.",
        404: "No group with the given ID exists, or the group has no invitation with the given ID.",
        409: "The invitation is no longer pending.",
        422: "One of the provided IDs is not a valid UUID.",
      }),
    },
  }),
  audited(groupInvitationAudit.CANCEL, (c) => ({
    id: c.req.param("invitationId"),
    groupId: c.req.param("id"),
  })),
  withAuth(),
  validateParam(paramSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const { invitationId } = c.var.param
    const result = await cancelGroupInvitation(db, { actor, groupId: group.id, invitationId })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id: invitationId })
  },
)
