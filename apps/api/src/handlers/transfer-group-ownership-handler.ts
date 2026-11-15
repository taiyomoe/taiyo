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
    summary: "Transfer a group's ownership",
    description:
      "Transfers your ownership of the group to another member: they become an owner and you become a regular member, in one step.\n\n**Required access:** the group owner.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Ownership transferred.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  fromUserId: z
                    .uuid()
                    .meta({ description: "The ID of your user, now a regular member." }),
                  toUserId: z.uuid().meta({ description: "The ID of the new owner." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not an owner of the group, or your account is banned.",
        404: "No group with the given ID exists, or the new owner is not a member of the group.",
        422: "The provided ID is not a valid UUID, or the request body failed validation, or `toUserId` is your own ID.",
      }),
    },
  }),
  audited(groupOwnershipAudit.TRANSFER),
  withAuth(),
  validateJson(transferSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { actor, db, group, user } = c.var
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

    const result = await transferGroupOwnership(db, { actor, groupId: group.id, toUserId })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, fromUserId: user.id, toUserId })
  },
)
