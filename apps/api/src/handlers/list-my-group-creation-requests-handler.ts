import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const itemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the request." }),
  status: z
    .enum(GROUP_OWNERSHIP_REQUEST_STATUSES)
    .meta({ description: "The status of the request.", example: "PENDING" }),
  name: z
    .string()
    .meta({ description: "The name of the requested group.", example: "Akira Scans" }),
  description: z.string().nullable().meta({
    description: "The description of the requested group, if any.",
    example: "Seinen and josei scanlations since 2018.",
  }),
  message: z.string().meta({ description: "Who you are and why the request should be approved." }),
  proofLinks: z
    .url()
    .array()
    .meta({
      description: "The public links proving the claim.",
      example: ["https://discord.gg/akira-scans"],
    }),
  reviewerNote: z.string().nullable().meta({
    description: "The explanation the reviewer left, if any.",
    example: "No proof of activity.",
  }),
  groupId: z
    .uuid()
    .nullable()
    .meta({ description: "The ID of the group created from the request, if any." }),
  createdAt: z.iso.datetime().meta({ description: "When you sent the request." }),
  updatedAt: z.iso.datetime().meta({ description: "When the request was last updated." }),
})

export const listMyGroupCreationRequestsHandler = new Hono().get(
  "/me/group-creation-requests",
  describeRoute({
    summary: "List my group creation requests",
    description:
      "Lists your requests for new groups, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "Your group creation requests.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(itemSchema.array())) },
        },
      },
      ...getOpenApiResponses({ 401: true, 403: true }),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var
    const rows = await db
      .selectFrom("groupCreationRequests")
      .select([
        "id",
        "status",
        "name",
        "description",
        "message",
        "proofLinks",
        "reviewerNote",
        "groupId",
        "createdAt",
        "updatedAt",
      ])
      .where("userId", "=", user.id)
      .orderBy("createdAt", "desc")
      .execute()

    return c.ok(rows)
  },
)
