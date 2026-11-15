import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkOwnershipRequest } from "../middlewares/check-ownership-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const cancelOwnershipRequestHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Cancel an ownership request",
    description:
      "Cancels a pending ownership request you filed.\n\n**Required access:** the requester.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "Ownership request cancelled.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the ownership request." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You did not file this request, or your account is banned.",
        404: "No ownership request with the given ID exists.",
        409: "The request is no longer pending.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupOwnershipAudit.REQUEST_CANCEL),
  withAuth(),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var

    c.var.audit.set({ target: { groupId: ownershipRequest.groupId } })

    if (ownershipRequest.userId !== user.id) {
      return c.fail("FORBIDDEN")
    }

    const transitioned = await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "CANCELLED" })
      .where("id", "=", ownershipRequest.id)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (transitioned === undefined) {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    return c.ok({ id: ownershipRequest.id })
  },
)
