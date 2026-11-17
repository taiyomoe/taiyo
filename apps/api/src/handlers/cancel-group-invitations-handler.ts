import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { cancelGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const cancelSchema = z.object({
  invitationIds: bulkIdsSchema("invitations", [
    "7d2e9b4f-1a6c-4f3e-8b5d-0c9a2e7f4b16",
    "b4f1a8c3-5e9d-4b2a-a7c6-3e8d1f5b9a72",
  ]),
})
const skippedInvitationSchema = skippedSchema(
  "invitation",
  ["NOT_FOUND", "FORBIDDEN", "NOT_PENDING"],
  "Why the invitation was left alone: the group has no such invitation, you did not send it and cannot send it yourself, or it was already answered.",
)
const SKIP_REASONS = {
  GROUP_INVITATION_NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  GROUP_INVITATION_NOT_PENDING: "NOT_PENDING",
} as const

export const cancelGroupInvitationsHandler = new Hono().delete(
  "/:id/invitations",
  describeRoute({
    summary: "Cancel group invitations in bulk",
    description:
      "Cancels several pending invitations to the group at once, exactly as cancelling each of them does. Invitations you cannot cancel, already answered ones and IDs the group has no invitation for are skipped and reported.\n\n**Required access:** for each invitation, the inviter, the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "The cancelled and skipped invitations.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("invitations", "cancelled", skippedInvitationSchema),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupInvitationAudit.CANCEL_MANY),
  withAuth(),
  validateJson(cancelSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedInvitationSchema>> = []

    for (const invitationId of c.var.json.invitationIds) {
      const result = await cancelGroupInvitation(db, { actor, groupId: group.id, invitationId })

      if (result.ok) {
        done.push(invitationId)
      } else if (result.error === "GROUP_NOT_FOUND") {
        return c.fail(result.error)
      } else {
        skipped.push({ id: invitationId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { invitationIds: done } } })

    return c.ok({ done, skipped })
  },
)
