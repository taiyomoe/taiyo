import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkGroup } from "../middlewares/check-group-middleware"
import { requireGroupOwnerOrMod } from "../middlewares/require-group-owner-or-mod-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), userId: z.uuid() })

export const promoteGroupMemberHandler = new Hono().post(
  "/:id/members/:userId/promote",
  describeRoute({
    summary: "Promote a member to OWNER",
    description:
      "Changes a member's role from MEMBER to OWNER.\n\n**Authentication:** group OWNER, moderator, admin.",
    tags: ["Group members"],
    responses: {
      201: {
        description: "Member promoted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ groupId: z.uuid(), userId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists, or the user has no membership on the group.",
        422: "The provided path parameters failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateParam(paramSchema),
  checkGroup(),
  requireGroupOwnerOrMod,
  withTransaction,
  async (c) => {
    const { db, group } = c.var
    const { userId } = c.var.param
    const target = await db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", group.id)
      .where("userId", "=", userId)
      .executeTakeFirst()

    if (!target) {
      return c.fail("GROUP_MEMBER_NOT_FOUND")
    }

    if (target.role !== "OWNER") {
      await db
        .updateTable("groupMemberships")
        .set({ role: "OWNER" })
        .where("groupId", "=", group.id)
        .where("userId", "=", userId)
        .execute()
    }

    return c.ok({ groupId: group.id, userId })
  },
)
