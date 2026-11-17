import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { approveGroupCreationRequest } from "../utils/group-creation-requests"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const approveSchema = z.object({
  requestIds: bulkIdsSchema("group creation requests", [
    "5c8e1f3a-2b7d-4c9e-a6f0-8d3b1e7c4a25",
    "e2a7d4c9-6f1b-4e3a-9c8d-1b5f7e2a6c90",
  ]),
})
const skippedRequestSchema = skippedSchema(
  "group creation request",
  ["NOT_FOUND", "NOT_PENDING", "NAME_TAKEN"],
  "Why the request was left alone: it does not exist, it is no longer pending, or a group with this name already exists.",
)
const SKIP_REASONS = {
  GROUP_CREATION_REQUEST_NOT_FOUND: "NOT_FOUND",
  GROUP_CREATION_REQUEST_NOT_PENDING: "NOT_PENDING",
  GROUP_NAME_TAKEN: "NAME_TAKEN",
} as const

export const approveGroupCreationRequestsHandler = new Hono().post(
  "/approve",
  describeRoute({
    summary: "Approve group creation requests in bulk",
    description:
      "Approves several pending group creation requests at once, each as if approved on its own: the group is created with the requested name and description, and its requester becomes its owner. Requests that do not exist, are no longer pending or ask for a name an existing group already has are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "The approved and skipped group creation requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("group creation requests", "approved", skippedRequestSchema),
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
  audited(groupCreationAudit.REQUEST_APPROVE_MANY),
  withAuth("groupCreationRequest.review"),
  validateJson(approveSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const done: string[] = []
    const groupIds: string[] = []
    const skipped: Array<z.infer<typeof skippedRequestSchema>> = []

    for (const requestId of c.var.json.requestIds) {
      const result = await approveGroupCreationRequest(db, { requestId, reviewerId: user.id })

      if (result.ok) {
        done.push(requestId)
        groupIds.push(result.groupId)
      } else {
        skipped.push({ id: requestId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { requestIds: done, groupIds } } })

    return c.ok({ done, skipped })
  },
)
