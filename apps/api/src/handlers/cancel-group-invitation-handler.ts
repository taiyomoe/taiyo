import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { getLockedPermissions, withGroupLock } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
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
    const result = await withGroupLock(db, group.id, async (trx) => {
      const invitation = await trx
        .selectFrom("groupInvitations")
        .select(["inviterId", "permissions", "status"])
        .where("id", "=", invitationId)
        .where("groupId", "=", group.id)
        .executeTakeFirst()

      if (invitation === undefined) {
        return { ok: false, error: "GROUP_INVITATION_NOT_FOUND" } as const
      }

      const can = await getLockedPermissions(trx, actor, group.id)

      if (
        invitation.inviterId !== actor.id &&
        !can("group.inviteMember", { groupId: group.id, permissions: invitation.permissions })
      ) {
        return { ok: false, error: "FORBIDDEN" } as const
      }

      if (invitation.status !== "PENDING") {
        return { ok: false, error: "GROUP_INVITATION_NOT_PENDING" } as const
      }

      await trx
        .updateTable("groupInvitations")
        .set({ status: "CANCELLED" })
        .where("id", "=", invitationId)
        .execute()

      return { ok: true } as const
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id: invitationId })
  },
)
