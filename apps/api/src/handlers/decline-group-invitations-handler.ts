import { groupInvitationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { declineGroupInvitation } from "../utils/group-invitations"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const declineSchema = z.object({
  invitationIds: bulkIdsSchema("invitations", [
    "7d2e9b4f-1a6c-4f3e-8b5d-0c9a2e7f4b16",
    "b4f1a8c3-5e9d-4b2a-a7c6-3e8d1f5b9a72",
  ]),
})
const skippedInvitationSchema = skippedSchema(
  "invitation",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the invitation was left alone: it was not sent to you, or it was already answered.",
)
const SKIP_REASONS = {
  GROUP_INVITATION_NOT_FOUND: "NOT_FOUND",
  GROUP_INVITATION_NOT_PENDING: "NOT_PENDING",
} as const

export const declineGroupInvitationsHandler = new Hono().post(
  "/decline",
  describeRoute({
    summary: "Decline group invitations in bulk",
    description:
      "Declines several pending invitations sent to you at once. Invitations that were not sent to you or were already answered are skipped and reported.\n\n**Required access:** the invitee.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "The declined and skipped invitations.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("invitations", "declined", skippedInvitationSchema),
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
  audited(groupInvitationAudit.DECLINE_MANY),
  withAuth(),
  validateJson(declineSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedInvitationSchema>> = []

    for (const invitationId of c.var.json.invitationIds) {
      const result = await declineGroupInvitation(db, { invitationId, userId: user.id })

      if (result.ok) {
        done.push(invitationId)
      } else {
        skipped.push({ id: invitationId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { invitationIds: done } } })

    return c.ok({ done, skipped })
  },
)
