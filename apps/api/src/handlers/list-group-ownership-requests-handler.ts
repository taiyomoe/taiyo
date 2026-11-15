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
    description: "Only list requests with this status. Lists every status when omitted.",
    example: "PENDING",
  }),
})
const ownershipRequestSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the ownership request." }),
  userId: z.uuid().meta({ description: "The ID of the requester." }),
  groupId: z.uuid().meta({ description: "The ID of the group." }),
  status: z
    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
    .meta({ description: "The status of the ownership request.", example: "PENDING" }),
  message: z.string().nullable().meta({
    description: "The requester's message to the admins, if any.",
    example: "I founded Akira Scans in 2019 and still lead the team.",
  }),
  proofLinks: z
    .url()
    .array()
    .meta({
      description: "The public links proving the requester's claim.",
      example: ["https://discord.gg/akira-scans"],
    }),
  reviewerId: z
    .uuid()
    .nullable()
    .meta({ description: "The ID of the admin who reviewed the request, if any." }),
  reviewerNote: z.string().nullable().meta({
    description: "The note the admin left for the requester, if any.",
    example: "No proof of ownership.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the request was filed." }),
  updatedAt: z.iso.datetime().meta({ description: "When the request was last updated." }),
})

export const listGroupOwnershipRequestsHandler = new Hono().get(
  "/:id/ownership-requests",
  describeRoute({
    summary: "List a group's ownership requests",
    description:
      "Lists the ownership requests on the group, newest first. Admins see every request; everyone else sees only their own.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "The matching ownership requests.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(ownershipRequestSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  withAuth(),
  validateQuery(querySchema),
  checkGroup(),
  async (c) => {
    const { can, db, group, user } = c.var
    const { status } = c.var.query
    let query = db.selectFrom("groupOwnershipRequests").selectAll().where("groupId", "=", group.id)

    if (!can("ownershipRequest.review")) {
      query = query.where("userId", "=", user.id)
    }

    if (status) {
      query = query.where("status", "=", status)
    }

    const rows = await query.orderBy("createdAt", "desc").execute()

    return c.ok(rows)
  },
)
