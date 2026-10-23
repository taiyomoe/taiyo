import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { claimGroup } from "../group-membership"
import { checkOwnershipRequest } from "../middlewares/check-ownership-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const approveOwnershipRequestHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve an ownership request",
    description:
      "Grants the requester OWNER membership on the group, and auto-cancels every other pending request on the same group.\n\n**Required roles:** admin.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "Ownership request approved.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ id: z.uuid(), groupId: z.uuid(), userId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No ownership request with the given id exists.",
        409: "The request is no longer pending, or the group already has an owner.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("ownershipRequest.review"),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var
    const result = await claimGroup(db, {
      groupId: ownershipRequest.groupId,
      userId: ownershipRequest.userId,
      addedBy: user.id,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    const transitioned = await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "APPROVED", reviewerId: user.id })
      .where("id", "=", ownershipRequest.id)
      .where("status", "=", "PENDING")
      .returning("id")
      .executeTakeFirst()

    if (transitioned === undefined) {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "CANCELLED" })
      .where("groupId", "=", ownershipRequest.groupId)
      .where("status", "=", "PENDING")
      .where("id", "!=", ownershipRequest.id)
      .execute()

    return c.ok({
      id: ownershipRequest.id,
      groupId: ownershipRequest.groupId,
      userId: ownershipRequest.userId,
    })
  },
)
