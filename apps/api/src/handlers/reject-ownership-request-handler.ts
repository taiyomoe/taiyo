import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
  withAuth("manage", "OwnershipRequest"),
  validateJson(rejectSchema),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var
    const { note } = c.var.json

    if (ownershipRequest.status !== "PENDING") {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: note ?? null })
      .where("id", "=", ownershipRequest.id)
      .execute()

    return c.ok({ id: ownershipRequest.id })
  },
)
