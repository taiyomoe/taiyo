import { GROUP_MEMBERSHIP_ROLES, GROUP_PERMISSIONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { addGroupMember } from "../group-membership"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const addMemberSchema = z.object({
  userId: z.uuid().meta({ description: "The ID of the user to add." }),
  role: z.enum(GROUP_MEMBERSHIP_ROLES).meta({ description: "OWNER or MEMBER.", example: "MEMBER" }),
  permissions: z.array(z.enum(GROUP_PERMISSIONS)).max(GROUP_PERMISSIONS.length).default([]).meta({
    description: "Group permissions granted to the member. Owners hold every permission.",
  }),
})

export const addGroupMemberHandler = new Hono().post(
  "/:id/members",
  describeRoute({
    summary: "Add a member to a group",
    description:
      "Adds a user to the group directly with the given role and permissions, without an invitation.\n\n**Authentication:** admin.",
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
  withAuth("group.addMember"),
  validateJson(addMemberSchema),
  checkGroup(),
  withTransaction,
  async (c) => {
    const { db, group, user } = c.var
    const { userId, role, permissions } = c.var.json
    const target = await db
      .selectFrom("users")
      .select("id")
      .where("id", "=", userId)
      .executeTakeFirst()

    if (!target) {
      return c.fail("NOT_FOUND", { resource: "user", id: userId })
    }

    const result = await addGroupMember(db, {
      groupId: group.id,
      userId,
      role,
      permissions,
      addedBy: user.id,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId, role })
  },
)
