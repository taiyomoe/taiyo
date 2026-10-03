import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const createOwnershipRequestSchema = z.object({
  message: z.string().min(1).max(2000).nullable().optional().meta({
    description: "Optional pitch from the requester for the reviewing moderator.",
    example: "I've been translating this group's releases for two years.",
  }),
})

export const createOwnershipRequestHandler = new Hono().post(
  "/:id/ownership-requests",
  describeRoute({
    summary: "Request ownership of a group",
    description:
      "Files a claim on an unowned group. A moderator will review and approve or reject.\n\n**Authentication:** any signed-in user.",
    tags: ["Group ownership"],
    requestBody: {
      content: {
        "application/json": await resolver(createOwnershipRequestSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Ownership request created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new ownership request." }),
                  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        409: "The group is already owned, or you already have a pending request for this group.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("create", "OwnershipRequest"),
  validateJson(createOwnershipRequestSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { message } = c.var.json
    const owned = await db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", group.id)
      .where("role", "=", "OWNER")
      .limit(1)
      .executeTakeFirst()

    if (owned) {
      return c.fail("GROUP_ALREADY_OWNED")
    }

    const existing = await db
      .selectFrom("groupOwnershipRequests")
      .select("id")
      .where("groupId", "=", group.id)
      .where("userId", "=", user.id)
      .where("status", "=", "PENDING")
      .executeTakeFirst()

    if (existing) {
      return c.fail("OWNERSHIP_REQUEST_EXISTS")
    }

    const row = await db
      .insertInto("groupOwnershipRequests")
      .values({
        userId: user.id,
        groupId: group.id,
        message: message ?? null,
      })
      .returning(["id", "status"])
      .executeTakeFirstOrThrow()

    return c.ok({ id: row.id, status: row.status })
  },
)
