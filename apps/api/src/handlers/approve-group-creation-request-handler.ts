import { groupCreationAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkGroupCreationRequest } from "../middlewares/check-group-creation-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { approveGroupCreationRequest } from "../utils/group-creation-requests"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const approveGroupCreationRequestHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve a group creation request",
    description:
      "Approves a pending group creation request: creates the group with the requested name and description, and makes the requester its owner.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "Group creation request approved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the group creation request." }),
                  groupId: z.uuid().meta({ description: "The ID of the new group." }),
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
        409: "The request is no longer pending, or a group with this name already exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupCreationAudit.REQUEST_APPROVE),
  withAuth("groupCreationRequest.review"),
  checkGroupCreationRequest(),
  withTransaction,
  async (c) => {
    const { db, groupCreationRequest, log, user } = c.var
    const result = await approveGroupCreationRequest(db, {
      requestId: groupCreationRequest.id,
      reviewerId: user.id,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    const { groupId } = result

    log.set({ group: { id: groupId } })
    c.var.audit.set({ target: { groupId, userId: result.userId, name: result.name } })

    return c.ok({ id: groupCreationRequest.id, groupId })
  },
)
