import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
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
      "Cancels a pending group creation request you filed.\n\n**Required access:** the requester.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "Group creation request cancelled.",
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
        404: "You filed no group creation request with the given ID.",
        409: "The request is no longer pending.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupCreationAudit.REQUEST_CANCEL),
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
