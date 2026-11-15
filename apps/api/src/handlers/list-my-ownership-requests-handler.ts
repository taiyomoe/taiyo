import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema } from "../utils/schemas"

const querySchema = z.object({
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES).optional().meta({
    description: "Only list requests with this status. Lists every status when omitted.",
    example: "PENDING",
  }),
})
const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the ownership request." }),
  groupId: z.uuid().meta({ description: "The ID of the group." }),
  group: groupSummarySchema.meta({ description: "The group you asked to own." }),
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
  reviewerNote: z.string().nullable().meta({
    description: "The note the admin left for the requester, if any.",
    example: "No proof of ownership.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the request was filed." }),
  updatedAt: z.iso.datetime().meta({ description: "When the request was last updated." }),
})

export const listMyOwnershipRequestsHandler = new Hono().get(
  "/mine",
  describeRoute({
    summary: "List my ownership requests",
    description:
      "Lists the ownership requests you filed across every group, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Group ownership"],
    responses: {
      200: {
        description: "Your ownership requests.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(itemSchema.array())) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
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
      .where("groups.deletedAt", "is", null)

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
