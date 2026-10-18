import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema } from "../utils/schemas"

const querySchema = z.object({
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).optional(),
})
const itemSchema = z.object({
  id: z.uuid(),
  groupId: z.uuid(),
  group: groupSummarySchema,
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
  message: z.string().nullable(),
  proofLinks: z.url().array(),
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
  withAuth(),
  validateQuery(querySchema),
  async (c) => {
    const { db, user } = c.var
    const { status } = c.var.query
    let query = db
      .selectFrom("groupOwnershipRequests")
      .innerJoin("groups", "groups.id", "groupOwnershipRequests.groupId")
      .select([
        "groupOwnershipRequests.id",
        "groupOwnershipRequests.groupId",
        "groupOwnershipRequests.status",
        "groupOwnershipRequests.message",
        "groupOwnershipRequests.proofLinks",
        "groupOwnershipRequests.reviewerNote",
        "groupOwnershipRequests.createdAt",
        "groupOwnershipRequests.updatedAt",
        "groups.name as groupName",
        "groups.logo as groupLogo",
      ])
      .where("groupOwnershipRequests.userId", "=", user.id)

    if (status) {
      query = query.where("groupOwnershipRequests.status", "=", status)
    }

    const rows = await query.orderBy("groupOwnershipRequests.createdAt", "desc").execute()

    return c.ok(
      rows.map(({ groupName, groupLogo, ...row }) => ({
        ...row,
        group: { id: row.groupId, name: groupName, logo: groupLogo },
      })),
    )
  },
)
