import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroupCreationRequest } from "../middlewares/check-group-creation-request-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, reviewNoteSchema } from "../utils/schemas"

const rejectSchema = z.object({
  note: reviewNoteSchema,
})

export const rejectGroupCreationRequestHandler = new Hono().post(
  "/:id/reject",
  describeRoute({
    summary: "Reject a group creation request",
    description:
      "Rejects a pending request for a new group with a note shown to the requester.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    requestBody: {
      content: { "application/json": await resolver(rejectSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Request rejected.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        404: "No request with the given id exists.",
        409: "The request is no longer pending.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("groupCreationRequest.review"),
  validateJson(rejectSchema),
  checkGroupCreationRequest(),
  withTransaction,
  async (c) => {
    const { db, groupCreationRequest, user } = c.var
    const transitioned = await db
      .updateTable("groupCreationRequests")
      .set({ status: "REJECTED", reviewerId: user.id, reviewerNote: c.var.json.note })
      .where("id", "=", groupCreationRequest.id)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (transitioned === undefined) {
      return c.fail("GROUP_CREATION_REQUEST_NOT_PENDING")
    }

    return c.ok({ id: groupCreationRequest.id })
  },
)
