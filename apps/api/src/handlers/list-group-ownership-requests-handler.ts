import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).optional().meta({
    description: "Filter by status. Default: no filter.",
  }),
})
const ownershipRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  groupId: z.uuid(),
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
  message: z.string().nullable(),
  reviewerId: z.uuid().nullable(),
  reviewerNote: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listGroupOwnershipRequestsHandler = new Hono().get(
  "/:id/ownership-requests",
  describeRoute({
    summary: "List ownership requests for a group",
    description:
      "Moderators see every request on the group. Everyone else sees only their own.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "Matching ownership requests.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(ownershipRequestSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id or query parameters failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateQuery(querySchema),
  checkGroup(),
  async (c) => {
    const { db, group, user } = c.var
    const { status } = c.var.query
    const isModerator = user.role === "ADMIN" || user.role === "MODERATOR"
    let query = db.selectFrom("groupOwnershipRequests").selectAll().where("groupId", "=", group.id)

    if (!isModerator) {
      query = query.where("userId", "=", user.id)
    }

    if (status) {
      query = query.where("status", "=", status)
    }

    const rows = await query.orderBy("createdAt", "desc").execute()

    return c.ok(rows)
  },
)
