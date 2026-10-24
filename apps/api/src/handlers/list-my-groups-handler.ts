import { GROUP_MEMBERSHIP_ROLES, GROUP_PERMISSIONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupSummarySchema } from "../utils/schemas"

const membershipSchema = z.object({
  group: groupSummarySchema,
  role: z.enum(GROUP_MEMBERSHIP_ROLES),
  permissions: z
    .enum(GROUP_PERMISSIONS)
    .array()
    .meta({ description: "Stored permissions. Owners hold every permission regardless." }),
  memberCount: z.int().meta({ description: "How many people belong to the group." }),
  joinedAt: z.iso.datetime(),
})

export const listMyGroupsHandler = new Hono().get(
  "/me/groups",
  describeRoute({
    summary: "List my groups",
    description:
      "Lists the groups the current user belongs to, with their role and permissions in each, owned groups first.\n\n**Authentication:** signed-in user.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "The current user's memberships.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(membershipSchema.array())) },
        },
      },
      ...getOpenApiResponses(),
    },
  }),
  withAuth(),
  async (c) => {
    const { db, user } = c.var
    const rows = await db
      .selectFrom("groupMemberships")
      .innerJoin("groups", "groups.id", "groupMemberships.groupId")
      .select((eb) => [
        "groups.id",
        "groups.name",
        "groups.logo",
        "groupMemberships.role",
        "groupMemberships.permissions",
        "groupMemberships.createdAt",
        eb
          .selectFrom("groupMemberships as others")
          .select(eb.fn.countAll<string>().as("count"))
          .whereRef("others.groupId", "=", "groups.id")
          .as("memberCount"),
      ])
      .where("groupMemberships.userId", "=", user.id)
      .where("groups.deletedAt", "is", null)
      .orderBy("groupMemberships.role", "asc")
      .orderBy("groups.name", "asc")
      .execute()

    return c.ok(
      rows.map((row) => ({
        group: { id: row.id, name: row.name, logo: row.logo },
        role: row.role,
        permissions: row.permissions,
        memberCount: Number(row.memberCount ?? 0),
        joinedAt: row.createdAt,
      })),
    )
  },
)
