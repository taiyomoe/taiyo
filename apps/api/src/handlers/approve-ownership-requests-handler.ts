import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { approveOwnershipRequest } from "../utils/ownership-requests"
import { apiSuccessEnvelope } from "../utils/schemas"

const approveSchema = z.object({
  requestIds: bulkIdsSchema("ownership requests", [
    "3f6b2a91-7c4d-4e8a-9b15-2d7e6c8f0a43",
    "a1d9c7e5-4b2f-4a6c-8e3d-5f7b9c1e2d64",
  ]),
})
const skippedRequestSchema = skippedSchema(
  "ownership request",
  ["NOT_FOUND", "NOT_PENDING", "ALREADY_OWNED"],
  "Why the request was left alone: it or its group does not exist, it is no longer pending, or its group already has an owner.",
)
const SKIP_REASONS = {
  OWNERSHIP_REQUEST_NOT_FOUND: "NOT_FOUND",
  GROUP_NOT_FOUND: "NOT_FOUND",
  OWNERSHIP_REQUEST_NOT_PENDING: "NOT_PENDING",
  GROUP_ALREADY_OWNED: "ALREADY_OWNED",
} as const

export const approveOwnershipRequestsHandler = new Hono().post(
  "/approve",
  describeRoute({
    summary: "Approve ownership requests in bulk",
    description:
      "Approves several pending ownership requests at once, each as if approved on its own: the requester becomes an owner of the group, and the other pending requests on the group are cancelled. Requests that do not exist, are no longer pending or target a group that already has an owner are skipped and reported, so only one request per group is approved.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "The approved and skipped ownership requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("ownership requests", "approved", skippedRequestSchema),
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
  audited(groupOwnershipAudit.REQUEST_APPROVE_MANY),
  withAuth("ownershipRequest.review"),
  validateJson(approveSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedRequestSchema>> = []

    for (const requestId of c.var.json.requestIds) {
      const result = await approveOwnershipRequest(db, { requestId, reviewerId: user.id })

      if (result.ok) {
        done.push(requestId)
      } else {
        skipped.push({ id: requestId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { requestIds: done } } })

    return c.ok({ done, skipped })
  },
)
