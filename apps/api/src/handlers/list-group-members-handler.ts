import { GROUP_MEMBERSHIP_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const memberItemSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  role: z.enum(GROUP_MEMBERSHIP_ROLES),
  createdAt: z.iso.datetime(),
})

export const listGroupMembersHandler = new Hono().get(
  "/:id/members",
  describeRoute({
    summary: "List members of a group",
    description: "Lists every member of the group with their role.\n\n**Authentication:** none.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Members of the group.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(memberItemSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkGroup(),
  async (c) => {
    const { db, group } = c.var
    const rows = await db
      .selectFrom("groupMemberships")
      .innerJoin("users", "users.id", "groupMemberships.userId")
      .where("groupMemberships.groupId", "=", group.id)
      .select([
        "users.id as userId",
        "users.username",
        "users.displayUsername",
        "users.image",
        "groupMemberships.role",
        "groupMemberships.createdAt",
      ])
      .orderBy("groupMemberships.role", "asc")
      .orderBy("users.username", "asc")
      .execute()

    return c.ok(rows)
  },
)
