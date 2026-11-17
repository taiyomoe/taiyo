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
import { rejectOwnershipRequest } from "../utils/ownership-requests"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  requestIds: bulkIdsSchema("ownership requests", [
    "3f6b2a91-7c4d-4e8a-9b15-2d7e6c8f0a43",
    "a1d9c7e5-4b2f-4a6c-8e3d-5f7b9c1e2d64",
  ]),
  note: reviewNoteSchema.meta({
    description:
      "Why the requests were rejected, shown to their requesters, up to 2000 characters.",
    example: "No proof of ownership.",
  }),
})
const skippedRequestSchema = skippedSchema(
  "ownership request",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the request was left alone: it does not exist or is no longer pending.",
)

export const rejectOwnershipRequestsHandler = new Hono().post(
  "/reject",
  describeRoute({
    summary: "Reject ownership requests in bulk",
    description:
      "Rejects several pending ownership requests at once, with the same note shown to each requester. Requests that do not exist or are no longer pending are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "The rejected and skipped ownership requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("ownership requests", "rejected", skippedRequestSchema),
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
  audited(groupOwnershipAudit.REQUEST_REJECT_MANY),
  withAuth("ownershipRequest.review"),
  validateJson(rejectSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { requestIds, note } = c.var.json
    const rows = await db
      .selectFrom("groupOwnershipRequests")
      .select("id")
      .where("id", "in", requestIds)
      .execute()
    const { found, missing } = partitionFound(requestIds, rows)
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedRequestSchema>> = missing.map((id) => ({
      id,
      reason: "NOT_FOUND",
    }))

    for (const { id } of found) {
      const result = await rejectOwnershipRequest(db, { requestId: id, reviewerId: user.id, note })

      if (result.ok) {
        done.push(id)
      } else {
        skipped.push({ id, reason: "NOT_PENDING" })
      }
    }

    c.var.audit.set({ reason: note, changes: { after: { requestIds: done } } })

    return c.ok({ done, skipped })
  },
)
