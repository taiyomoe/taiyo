import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkOwnershipRequest } from "../middlewares/check-ownership-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { approveOwnershipRequest } from "../utils/ownership-requests"
import { apiSuccessEnvelope } from "../utils/schemas"

export const approveOwnershipRequestHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve an ownership request",
    description:
      "Approves a pending ownership request: the requester becomes an owner of the group, and every other pending request on the group is cancelled.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "Ownership request approved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the ownership request." }),
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of the requester, now an owner." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No ownership request with the given ID exists, or its group no longer exists.",
        409: "The request is no longer pending, or the group already has an owner.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(groupOwnershipAudit.REQUEST_APPROVE),
  withAuth("ownershipRequest.review"),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var

    c.var.audit.set({
      target: { groupId: ownershipRequest.groupId, userId: ownershipRequest.userId },
    })

    const result = await approveOwnershipRequest(db, {
      requestId: ownershipRequest.id,
      reviewerId: user.id,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({
      id: ownershipRequest.id,
      groupId: ownershipRequest.groupId,
      userId: ownershipRequest.userId,
    })
  },
)
