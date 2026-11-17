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
import { rejectOwnershipRequest } from "../utils/ownership-requests"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  note: reviewNoteSchema,
})

export const rejectOwnershipRequestHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject an ownership request",
    description:
      "Rejects a pending ownership request, with a note shown to the requester.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "Ownership request rejected.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the ownership request." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No ownership request with the given ID exists.",
        409: "The request is no longer pending.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupOwnershipAudit.REQUEST_REJECT),
  withAuth("ownershipRequest.review"),
  validateJson(rejectSchema),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var
    const { note } = c.var.json

    c.var.audit.set({
      target: { groupId: ownershipRequest.groupId, userId: ownershipRequest.userId },
      reason: note,
    })

    const result = await rejectOwnershipRequest(db, {
      requestId: ownershipRequest.id,
      reviewerId: user.id,
      note,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ id: ownershipRequest.id })
  },
)
