import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).optional(),
})
const itemSchema = z.object({
  id: z.uuid(),
  groupId: z.uuid(),
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
  message: z.string().nullable(),
  reviewerNote: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listMyOwnershipRequestsHandler = new Hono().get(
  "/mine",
  describeRoute({
    summary: "List ownership requests I have filed",
    description:
      "Returns the current user's ownership requests across all groups.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "The current user's ownership requests.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(itemSchema.array())) },
        },
      },
      ...getOpenApiResponses({ 422: "The query parameters failed validation." }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { status } = c.var.query
    let query = db
      .selectFrom("groupOwnershipRequests")
      .select(["id", "groupId", "status", "message", "reviewerNote", "createdAt", "updatedAt"])
      .where("userId", "=", user.id)

    if (status) {
      query = query.where("status", "=", status)
    }

    const rows = await query.orderBy("createdAt", "desc").execute()

    return c.ok(rows)
  },
)
