import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
      "Grants the requester OWNER membership on the group, and auto-cancels every other pending request on the same group.\n\n**Required roles:** moderator, admin.",
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
  withAuth("manage", "OwnershipRequest"),
  checkOwnershipRequest(),
  withTransaction,
  async (c) => {
    const { db, ownershipRequest, user } = c.var

    if (ownershipRequest.status !== "PENDING") {
      return c.fail("OWNERSHIP_REQUEST_NOT_PENDING")
    }

    // Serialize concurrent approvals on the same group. Without this lock the
    // SELECT below and the INSERT can both run in parallel transactions, both
    // see no OWNER, and both insert — producing two OWNERs from the request
    // workflow even though the intent is "first approval wins, the rest are
    // auto-cancelled below". The lock is transaction-scoped and keyed on the
    // group, so approvals for different groups still proceed in parallel.
    await sql`SELECT pg_advisory_xact_lock(hashtextextended(${ownershipRequest.groupId}::text, 0))`.execute(
      db,
    )

    const owned = await db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", ownershipRequest.groupId)
      .where("role", "=", "OWNER")
      .limit(1)
      .executeTakeFirst()

    if (owned) {
      return c.fail("GROUP_ALREADY_OWNED")
    }

    await db
      .insertInto("groupMemberships")
      .values({
        userId: ownershipRequest.userId,
        groupId: ownershipRequest.groupId,
        role: "OWNER",
        addedBy: user.id,
      })
      .execute()

    await db
      .updateTable("groupOwnershipRequests")
      .set({ status: "APPROVED", reviewerId: user.id })
      .where("id", "=", ownershipRequest.id)
      .execute()

    // Auto-cancel any other pending request on the same group.
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
