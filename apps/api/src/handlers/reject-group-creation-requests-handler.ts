import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { rejectGroupCreationRequest } from "../utils/group-creation-requests"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  requestIds: bulkIdsSchema("group creation requests", [
    "5c8e1f3a-2b7d-4c9e-a6f0-8d3b1e7c4a25",
    "e2a7d4c9-6f1b-4e3a-9c8d-1b5f7e2a6c90",
  ]),
  note: reviewNoteSchema.meta({
    description:
      "Why the requests were rejected, shown to their requesters, up to 2000 characters.",
    example: "No proof that the group is active.",
  }),
})
const skippedRequestSchema = skippedSchema(
  "group creation request",
  ["NOT_FOUND", "NOT_PENDING"],
  "Why the request was left alone: it does not exist or is no longer pending.",
)

export const rejectGroupCreationRequestsHandler = new Hono().post(
  "/reject",
  describeRoute({
    summary: "Reject group creation requests in bulk",
    description:
      "Rejects several pending group creation requests at once, with the same note shown to each requester. Requests that do not exist or are no longer pending are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "The rejected and skipped group creation requests.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                bulkResultSchema("group creation requests", "rejected", skippedRequestSchema),
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
  audited(groupCreationAudit.REQUEST_REJECT_MANY),
  withAuth("groupCreationRequest.review"),
  validateJson(rejectSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { requestIds, note } = c.var.json
    const rows = await db
      .selectFrom("groupCreationRequests")
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
      const result = await rejectGroupCreationRequest(db, {
        requestId: id,
        reviewerId: user.id,
        note,
      })

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
