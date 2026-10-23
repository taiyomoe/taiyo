import { GROUP_PERMISSIONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { normalizeGroupPermissions, updateGroupMemberPermissions } from "../group-membership"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid(), userId: z.uuid() })
const updateMemberSchema = z.object({
  permissions: z
    .array(z.enum(GROUP_PERMISSIONS))
    .max(GROUP_PERMISSIONS.length)
    .meta({
      description: "The member's full set of group permissions. Replaces the current set.",
      example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    }),
})

export const updateGroupMemberHandler = new Hono().patch(
  "/:id/members/:userId",
  describeRoute({
    summary: "Update a member's permissions",
    description:
      "Replaces the group permissions of a member. Owners can set any permission on members. Members with `MANAGE_MEMBERS` can only grant or revoke permissions they hold themselves, never `MANAGE_MEMBERS`, and cannot edit themselves, other managers, or members holding permissions they lack. Owners' permissions can only be changed by admins.\n\n**Authentication:** group owner, member with `MANAGE_MEMBERS`, admin.",
    tags: ["Group members"],
    requestBody: {
      content: { "application/json": await resolver(updateMemberSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Permissions updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid(),
                  userId: z.uuid(),
                  permissions: z.array(z.enum(GROUP_PERMISSIONS)),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No group with the given id exists, or the user has no membership on the group.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  validateJson(updateMemberSchema),
  checkGroup(),
  authorizeGroup("manageMembers"),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const { userId } = c.var.param
    const permissions = normalizeGroupPermissions(c.var.json.permissions)
    const result = await updateGroupMemberPermissions(db, {
      actor,
      groupId: group.id,
      userId,
      permissions,
    })

    if (!result.ok) {
      return c.fail(result.error)
    }

    return c.ok({ groupId: group.id, userId, permissions })
  },
)
