import { groupOwnershipAudit } from "@taiyomoe/audit"
import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, proofLinksSchema, requestMessageSchema } from "../utils/schemas"

const createOwnershipRequestSchema = z.object({
  message: requestMessageSchema,
  proofLinks: proofLinksSchema,
})

export const createOwnershipRequestHandler = new Hono().post(
  "/:id/ownership-requests",
  describeRoute({
    summary: "Request ownership of a group",
    description:
      "Requests ownership of a group that has no owner, with a message and public links proving you run it. An admin reviews the request and approves or rejects it.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      201: {
        description: "Ownership request created.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the ownership request." }),
                  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).meta({
                    description: "The status of the ownership request.",
                    example: "PENDING",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists.",
        409: "The group already has an owner, or you already have a pending ownership request for it.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupOwnershipAudit.REQUEST_CREATE, (c) => ({ groupId: c.req.param("id") })),
  withAuth("ownershipRequest.create"),
  validateJson(createOwnershipRequestSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { message, proofLinks } = c.var.json
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
        message,
        proofLinks,
      })
      .returning(["id", "status"])
      .executeTakeFirstOrThrow()

    c.var.audit.set({ target: { id: row.id } })

    return c.ok({ id: row.id, status: row.status })
  },
)
