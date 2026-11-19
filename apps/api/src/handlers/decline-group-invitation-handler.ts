import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { declineGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the invitation." }) })

export const declineGroupInvitationHandler = new Hono().post(
  "/:id/decline",
  describeRoute({
    summary: "Decline a group invitation",
    description: "Declines a pending invitation sent to you.\n\n**Required access:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation declined.",
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
        403: true,
        404: "No invitation with the given ID was sent to you.",
        409: "The invitation is no longer pending.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupInvitationAudit.DECLINE),
  withAuth(),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const result = await declineGroupInvitation(db, { invitationId: id, userId: user.id })

    if (result.groupId !== null) {
      c.var.audit.set({ target: { groupId: result.groupId } })
    }

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id })
  },
)
