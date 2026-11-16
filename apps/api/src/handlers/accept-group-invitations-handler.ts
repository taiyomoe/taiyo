import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { acceptGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const acceptSchema = z.object({
  invitationIds: bulkIdsSchema("invitations", [
    "7d2e9b4f-1a6c-4f3e-8b5d-0c9a2e7f4b16",
    "b4f1a8c3-5e9d-4b2a-a7c6-3e8d1f5b9a72",
  ]),
})
const skippedInvitationSchema = skippedSchema(
  "invitation",
  ["NOT_FOUND", "NOT_PENDING", "EXPIRED", "INVALID", "ALREADY_MEMBER"],
  "Why the invitation was left alone: it was not sent to you or its group no longer exists, it was already answered, it expired, its sender can no longer grant its permissions, or you are already a member of the group.",
)
const SKIP_REASONS = {
  GROUP_INVITATION_NOT_FOUND: "NOT_FOUND",
  GROUP_NOT_FOUND: "NOT_FOUND",
  GROUP_INVITATION_NOT_PENDING: "NOT_PENDING",
  GROUP_INVITATION_EXPIRED: "EXPIRED",
  GROUP_INVITATION_INVALID: "INVALID",
  GROUP_MEMBER_EXISTS: "ALREADY_MEMBER",
} as const

export const acceptGroupInvitationsHandler = new Hono().post(
  "/accept",
  describeRoute({
    summary: "Accept group invitations in bulk",
    description:
      "Accepts several invitations sent to you at once, each as if accepted on its own: you join each group with the permissions its invitation grants. Invitations that were not sent to you, were already answered, expired, can no longer be granted by their sender, or invite you to a group you belong to are skipped and reported.\n\n**Required access:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "The accepted and skipped invitations.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("invitations", "accepted", skippedInvitationSchema),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(groupInvitationAudit.ACCEPT_MANY),
  withAuth(),
  validateJson(acceptSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const done: string[] = []
    const groupIds: string[] = []
    const skipped: Array<z.infer<typeof skippedInvitationSchema>> = []

    for (const invitationId of c.var.json.invitationIds) {
      const result = await acceptGroupInvitation(db, { invitationId, userId: user.id })

      if (result.ok) {
        done.push(invitationId)
        groupIds.push(result.groupId)
      } else {
        skipped.push({ id: invitationId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { invitationIds: done, groupIds } } })

    return c.ok({ done, skipped })
  },
)
