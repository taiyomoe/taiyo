import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { acceptGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the invitation." }) })

export const acceptGroupInvitationHandler = new Hono().post(
  "/:id/accept",
  describeRoute({
    summary: "Accept a group invitation",
    description:
      "Accepts an invitation sent to you, and joins the group with the permissions it grants. It fails if the invitation expired, or if its sender can no longer grant those permissions.\n\n**Required access:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Invitation accepted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the invitation." }),
                  groupId: z.uuid().meta({ description: "The ID of the group you joined." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No invitation with the given ID was sent to you, or its group no longer exists.",
        409: "The invitation is no longer pending or has expired, or its sender can no longer grant its permissions, or you are already a member of the group.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupInvitationAudit.ACCEPT),
  withAuth(),
  validateParam(paramSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { id } = c.var.param
    const result = await acceptGroupInvitation(db, { invitationId: id, userId: user.id })

    if (result.groupId !== null) {
      c.var.audit.set({ target: { groupId: result.groupId } })
    }

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id, groupId: result.groupId })
  },
)
