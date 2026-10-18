import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroupCreationRequest } from "../middlewares/check-group-creation-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const cancelGroupCreationRequestHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Cancel a group creation request",
    description:
      "Cancels a pending request for a new group. Only the requester can cancel it.\n\n**Authentication:** the requester.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "Request cancelled.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))) },
        },
      },
      ...getOpenApiResponses({
        404: "No request with the given id exists.",
        409: "The request is no longer pending.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkGroupCreationRequest(),
  withTransaction,
  async (c) => {
    const { db, groupCreationRequest, user } = c.var

    if (groupCreationRequest.userId !== user.id) {
      return c.fail("GROUP_CREATION_REQUEST_NOT_FOUND")
    }

    const transitioned = await db
      .updateTable("groupCreationRequests")
      .set({ status: "CANCELLED" })
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
