import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { cancelGroupCreationRequest } from "../utils/group-creation-requests"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const cancelSchema = z.object({
  requestIds: bulkIdsSchema("group creation requests", [
    "5c8e1f3a-2b7d-4c9e-a6f0-8d3b1e7c4a25",
    "e2a7d4c9-6f1b-4e3a-9c8d-1b5f7e2a6c90",
  ]),
})
const skippedRequestSchema = skippedSchema(
  "group creation request",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the request was left alone: you filed no request with this ID, or it is no longer pending.",
)

export const cancelGroupCreationRequestsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Cancel my group creation requests in bulk",
    description:
      "Cancels several pending group creation requests you filed at once. Requests you did not file and requests that are no longer pending are skipped and reported.\n\n**Required access:** the requester.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "The cancelled and skipped group creation requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("group creation requests", "cancelled", skippedRequestSchema),
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
  audited(groupCreationAudit.REQUEST_CANCEL_MANY),
  withAuth(),
  validateJson(cancelSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { requestIds } = c.var.json
    const rows = await db
      .selectFrom("groupCreationRequests")
      .select("id")
      .where("id", "in", requestIds)
      .where("userId", "=", user.id)
      .execute()
    const { found, missing } = partitionFound(requestIds, rows)
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedRequestSchema>> = missing.map((id) => ({
      id,
      reason: "NOT_FOUND",
    }))

    for (const { id } of found) {
      const result = await cancelGroupCreationRequest(db, id)

      if (result.ok) {
        done.push(id)
      } else {
        skipped.push({ id, reason: "NOT_PENDING" })
      }
    }

    c.var.audit.set({ changes: { after: { requestIds: done } } })

    return c.ok({ done, skipped })
  },
)
