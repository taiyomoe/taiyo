import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { cancelOwnershipRequest } from "../utils/ownership-requests"
import { apiSuccessEnvelope } from "../utils/schemas"

const cancelSchema = z.object({
  requestIds: bulkIdsSchema("ownership requests", [
    "3f6b2a91-7c4d-4e8a-9b15-2d7e6c8f0a43",
    "a1d9c7e5-4b2f-4a6c-8e3d-5f7b9c1e2d64",
  ]),
})
const skippedRequestSchema = skippedSchema(
  "ownership request",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the request was left alone: you filed no request with this ID, or it is no longer pending.",
)

export const cancelOwnershipRequestsHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Cancel my ownership requests in bulk",
    description:
      "Cancels several pending ownership requests you filed at once. Requests you did not file and requests that are no longer pending are skipped and reported.\n\n**Required access:** the requester.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "The cancelled and skipped ownership requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("ownership requests", "cancelled", skippedRequestSchema),
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
  audited(groupOwnershipAudit.REQUEST_CANCEL_MANY),
  withAuth(),
  validateJson(cancelSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { requestIds } = c.var.json
    const rows = await db
      .selectFrom("groupOwnershipRequests")
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
      const result = await cancelOwnershipRequest(db, id)

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
