import { GROUP_MEMBERSHIP_ROLES, GROUP_PERMISSIONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const memberItemSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  displayUsername: z.string(),
  image: z.string().nullable(),
  role: z.enum(GROUP_MEMBERSHIP_ROLES),
  permissions: z.enum(GROUP_PERMISSIONS).array().nullable().meta({
    description:
      "The member's stored permissions. Only visible to the group's owners, members with `MANAGE_MEMBERS` and admins; null for everyone else.",
  }),
  createdAt: z.iso.datetime(),
})

export const listGroupMembersHandler = new Hono().get(
  "/:id/members",
  describeRoute({
    summary: "List members of a group",
    description:
      "Lists every member of the group with their role. Permissions are only included for the group's owners, members with `MANAGE_MEMBERS` and admins.\n\n**Authentication:** none.",
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
  withOptionalAuth,
  checkGroup(),
  async (c) => {
    const { can, db, group } = c.var
    const showPermissions = can("group.manageMembers", { id: group.id })
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
        "groupMemberships.permissions",
        "groupMemberships.createdAt",
      ])
      .orderBy("groupMemberships.role", "asc")
      .orderBy("users.username", "asc")
      .execute()

    return c.ok(
      rows.map((row) => ({ ...row, permissions: showPermissions ? row.permissions : null })),
    )
  },
)
