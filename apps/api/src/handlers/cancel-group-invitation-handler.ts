import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { getLockedPermissions, withGroupLock } from "../group-membership"
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
