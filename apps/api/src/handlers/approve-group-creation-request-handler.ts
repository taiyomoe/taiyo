import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroupCreationRequest } from "../middlewares/check-group-creation-request-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { isGroupNameTaken } from "../utils/group-names"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const approveGroupCreationRequestHandler = new Hono().post(
  "/:id/approve",
  describeRoute({
    summary: "Approve a group creation request",
    description:
      "Creates the requested group and makes the requester its owner.\n\n**Required roles:** admin.",
    tags: ["Group creation requests"],
    responses: {
      201: {
        description: "Request approved and group created.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid(), groupId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No request with the given id exists.",
        409: "The request is no longer pending, or a group already has this name.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("groupCreationRequest.review"),
  checkGroupCreationRequest(),
  withTransaction,
  async (c) => {
    const { db, groupCreationRequest, log, user } = c.var
    const request = await db
      .selectFrom("groupCreationRequests")
      .select(["status", "userId", "name", "description"])
      .where("id", "=", groupCreationRequest.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (request.status !== "PENDING") {
      return c.fail("GROUP_CREATION_REQUEST_NOT_PENDING")
    }

    if (await isGroupNameTaken(db, request.name)) {
      return c.fail("GROUP_NAME_TAKEN")
    }

    const groupId = crypto.randomUUID()

    log.set({ group: { id: groupId } })

    await db
      .insertInto("groups")
      .values({
        id: groupId,
        name: request.name,
        description: request.description,
        creatorId: user.id,
      })
      .execute()
    await db
      .insertInto("groupMemberships")
      .values({ groupId, userId: request.userId, role: "OWNER", addedBy: user.id })
      .execute()
    await db
      .updateTable("groupCreationRequests")
      .set({ status: "APPROVED", reviewerId: user.id, groupId })
      .where("id", "=", groupCreationRequest.id)
      .execute()

    return c.ok({ id: groupCreationRequest.id, groupId })
  },
)
