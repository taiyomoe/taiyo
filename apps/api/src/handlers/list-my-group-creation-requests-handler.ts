import { GROUP_OWNERSHIP_REQUEST_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const itemSchema = z.object({
  id: z.uuid(),
  status: z.enum(GROUP_OWNERSHIP_REQUEST_STATUSES),
  name: z.string(),
  description: z.string().nullable(),
  message: z.string(),
  proofLinks: z.url().array(),
  reviewerNote: z.string().nullable(),
  groupId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export const listMyGroupCreationRequestsHandler = new Hono().get(
  "/me/group-creation-requests",
  describeRoute({
    summary: "List my group creation requests",
    description:
      "Returns the current user's requests for new groups, newest first.\n\n**Authentication:** signed-in user.",
    tags: ["Group creation requests"],
    responses: {
      200: {
        description: "The current user's group creation requests.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(itemSchema.array())) },
        },
      },
      ...getOpenApiResponses(),
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
