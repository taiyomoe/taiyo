import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
      "Rejects a pending group creation request, with a note shown to the requester.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "Group creation request rejected.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the group creation request." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group creation request with the given ID exists.",
        409: "The request is no longer pending.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupCreationAudit.REQUEST_REJECT),
  withAuth("groupCreationRequest.review"),
  validateJson(rejectSchema),
  checkGroupCreationRequest(),
  withTransaction,
  async (c) => {
    const { db, groupCreationRequest, user } = c.var

    c.var.audit.set({ reason: c.var.json.note })

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
