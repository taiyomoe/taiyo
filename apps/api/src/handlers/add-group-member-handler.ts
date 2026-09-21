import { GROUP_MEMBERSHIP_ROLES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { requireGroupOwnerOrMod } from "../middlewares/require-group-owner-or-mod-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const addMemberSchema = z.object({
  userId: z.uuid().meta({ description: "The ID of the user to add." }),
  role: z.enum(GROUP_MEMBERSHIP_ROLES).meta({ description: "OWNER or MEMBER.", example: "MEMBER" }),
})

export const addGroupMemberHandler = new Hono().post(
  "/:id/members",
  describeRoute({
    summary: "Add a member to a group",
    description:
      "Adds a user to the group with the given role. Only existing owners of the group and moderators / admins may call this.\n\n**Authentication:** group OWNER, moderator, admin.",
    tags: ["Group members"],
    requestBody: {
      content: { "application/json": await resolver(addMemberSchema).toOpenAPISchema() },
    },
    responses: {
      201: {
        description: "Member added.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid(),
                  userId: z.uuid(),
                  role: z.enum(GROUP_MEMBERSHIP_ROLES),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists or the target user does not exist.",
        409: "The user is already a member of this group.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateJson(addMemberSchema),
  checkGroup(),
  requireGroupOwnerOrMod,
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { userId, role } = c.var.json
    const target = await db
      .selectFrom("users")
      .select("id")
      .where("id", "=", userId)
      .executeTakeFirst()

    if (!target) {
      return c.fail("NOT_FOUND", { resource: "user", id: userId })
    }

    const existing = await db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", group.id)
      .where("userId", "=", userId)
      .executeTakeFirst()

    if (existing) {
      return c.fail("GROUP_MEMBER_EXISTS")
    }

    await db
      .insertInto("groupMemberships")
      .values({ groupId: group.id, userId, role, addedBy: user.id })
      .execute()

    return c.ok({ groupId: group.id, userId, role })
  },
)
