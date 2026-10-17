import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkOwnershipRequest } from "../middlewares/check-ownership-request-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const rejectSchema = z.object({
  note: z.string().min(1).max(2000).nullable().optional().meta({
    description: "Optional explanation shown to the requester.",
    example: "Already in talks with another applicant.",
  }),
})

export const rejectOwnershipRequestHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject an ownership request",
    description: "Rejects a pending ownership request.\n\n**Required roles:** moderator, admin.",
    tags: ["Group ownership"],
    requestBody: {
      content: { "application/json": await resolver(rejectSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Ownership request rejected.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No ownership request with the given id exists.",
        409: "The request is no longer pending.",
        422: "The request data failed validation.",
      }),
    },
  }),
  audited(groupOwnershipAudit.REQUEST_REJECT),
  withAuth("manage", "OwnershipRequest"),
  validateJson(rejectSchema),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var
    const { note } = c.var.json

    c.var.audit.set({
      target: { groupId: ownershipRequest.groupId, userId: ownershipRequest.userId },
      ...(note === null || note === undefined ? {} : { reason: note }),
    })

    const transitioned = await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: note ?? null })
      .where("id", "=", ownershipRequest.id)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (transitioned === undefined) {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    return c.ok({ id: ownershipRequest.id })
  },
)
