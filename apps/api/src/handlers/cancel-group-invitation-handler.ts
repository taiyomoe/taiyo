import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { cancelGroupInvitation } from "../group-membership"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), invitationId: z.uuid() })

export const cancelGroupInvitationHandler = new Hono().delete(
  "/:id/invitations/:invitationId",
  describeRoute({
    summary: "Cancel an invitation",
    description:
      "Cancels a pending invitation. The person who sent it can always cancel it; others need to be able to send the same invitation themselves.\n\n**Authentication:** the inviter, group owner, member with `MANAGE_MEMBERS`, admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Invitation cancelled.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        404: "No group or invitation with the given id exists.",
        409: "The invitation was already answered or cancelled.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
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
