import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkOwnershipRequest } from "../middlewares/check-ownership-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const cancelOwnershipRequestHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Cancel a pending ownership request",
    description:
      "Cancels a pending ownership request you previously filed. Only the original requester can cancel their own request, and only while it is still pending.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "Ownership request cancelled.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No ownership request with the given id exists.",
        409: "The request is no longer pending.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "OwnershipRequest"),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var

    if (ownershipRequest.userId !== user.id) {
      return c.fail("FORBIDDEN")
    }

    if (ownershipRequest.status !== "PENDING") {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "CANCELLED" })
      .where("id", "=", ownershipRequest.id)
      .execute()

    return c.ok({ id: ownershipRequest.id })
  },
)
