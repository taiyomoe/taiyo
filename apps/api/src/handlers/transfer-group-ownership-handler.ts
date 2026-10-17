import { groupOwnershipAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { transferGroupOwnership } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const transferSchema = z.object({
  toUserId: z.uuid().meta({ description: "The ID of the member who becomes an owner." }),
})

export const transferGroupOwnershipHandler = new Hono().post(
  "/:id/transfer",
  describeRoute({
    summary: "Transfer group ownership",
    description:
      "Makes another member of the group an OWNER and demotes you to MEMBER in one step.\n\n**Authentication:** group OWNER.",
    tags: ["Group members"],
    requestBody: {
      content: { "application/json": await resolver(transferSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Ownership transferred.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ groupId: z.uuid(), fromUserId: z.uuid(), toUserId: z.uuid() }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        403: "You are not an owner of the group.",
        404: "No group with the given id exists, or the target user has no membership on the group.",
        422: "The request data failed validation, or the target is yourself.",
      }),
    },
  }),
  audited(groupOwnershipAudit.TRANSFER),
  withAuth("read", "OwnershipRequest"),
  validateJson(transferSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { toUserId } = c.var.json

    c.var.audit.set({ target: { toUserId } })

    if (toUserId === user.id) {
      return c.fail("VALIDATION_ERROR", [
        {
          code: "custom",
          path: ["toUserId"],
          message: "You cannot transfer ownership to yourself.",
        },
      ])
    }

    const result = await transferGroupOwnership(db, {
      groupId: group.id,
      fromUserId: user.id,
      toUserId,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, fromUserId: user.id, toUserId })
  },
)
