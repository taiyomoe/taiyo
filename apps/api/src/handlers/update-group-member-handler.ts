import { groupMemberAudit } from "@taiyomoe/audit"
import { GROUP_PERMISSIONS } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { normalizeGroupPermissions, updateGroupMemberPermissions } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the group." }),
  userId: z.uuid().meta({ description: "The ID of the member." }),
})
const updateMemberSchema = z.object({
  permissions: z
    .array(z.enum(GROUP_PERMISSIONS))
    .max(GROUP_PERMISSIONS.length)
    .meta({
      description: "The full set of group permissions of the member, replacing the current one.",
      example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    }),
})

export const updateGroupMemberHandler = new Hono().patch(
  "/:id/members/:userId",
  describeRoute({
    summary: "Update a member's permissions",
    description:
      "Updates the group permissions of a member, replacing them all. The group owner can set any permissions on a member who is not an owner; a member with the `MANAGE_MEMBERS` permission can only grant or revoke permissions they hold, never `MANAGE_MEMBERS`, and cannot edit themselves, other managers or members holding permissions they lack. Only an admin can change an owner's permissions.\n\n**Required access:** the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "Member permissions updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  groupId: z.uuid().meta({ description: "The ID of the group." }),
                  userId: z.uuid().meta({ description: "The ID of the member." }),
                  permissions: z.array(z.enum(GROUP_PERMISSIONS)).meta({
                    description: "The new group permissions of the member.",
                    example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot change this member's permissions, or your account is banned.",
        404: "No group with the given ID exists, or the user is not a member of the group.",
        422: "One of the provided IDs is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupMemberAudit.UPDATE, (c) => ({
    id: c.req.param("id"),
    userId: c.req.param("userId"),
  })),
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

    c.var.audit.set({
      changes: auditChanges({ permissions: result.previous }, { permissions }),
    })

    return c.ok({ groupId: group.id, userId, permissions })
  },
)
