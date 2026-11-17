import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { updateGroupMemberPermissions } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, groupPermissionsSchema } from "../utils/schemas"

const updateMembersSchema = z
  .object({
    userIds: bulkIdsSchema("members", [
      "0d3c5b9e-7f1a-4c2e-9b8d-6a5f4e3d2c1b",
      "a7e2f9c4-1b3d-4e5f-8a6b-9c0d1e2f3a4b",
    ]),
    grant: groupPermissionsSchema.default([]).meta({
      description: "The group permissions to add to every member.",
      example: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    }),
    revoke: groupPermissionsSchema.default([]).meta({
      description: "The group permissions to take away from every member.",
      example: ["DELETE_CHAPTERS"],
    }),
  })
  .refine(({ grant, revoke }) => grant.length + revoke.length > 0, {
    message: "Grant or revoke at least one permission.",
  })
  .refine(({ grant, revoke }) => !grant.some((permission) => revoke.includes(permission)), {
    message: "A permission cannot be both granted and revoked.",
  })
const skippedMemberSchema = skippedSchema(
  "member",
  ["NOT_FOUND", "FORBIDDEN"],
  "Why the member was left alone: the user is not a member of the group, or you cannot make this change to their permissions.",
)
const SKIP_REASONS = {
  GROUP_MEMBER_NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
} as const

export const updateGroupMembersHandler = new Hono().patch(
  "/:id/members",
  describeRoute({
    summary: "Update members' permissions in bulk",
    description:
      "Grants and revokes the same group permissions on several members at once, keeping their other permissions, exactly as updating each member's permissions does. Members you cannot make this change to, and users who are not members of the group, are skipped and reported.\n\n**Required access:** the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "The updated and skipped members.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("members", "updated", skippedMemberSchema)),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You cannot manage the members of the group, or your account is banned.",
        404: "No group with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(groupMemberAudit.UPDATE_MANY),
  withAuth(),
  checkGroup(),
  authorizeGroup("manageMembers"),
  validateJson(updateMembersSchema),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const { userIds, grant, revoke } = c.var.json
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedMemberSchema>> = []
    const previous: Record<string, readonly string[]> = {}

    for (const userId of userIds) {
      const result = await updateGroupMemberPermissions(db, {
        actor,
        groupId: group.id,
        userId,
        permissions: (current) => [
          ...current.filter((permission) => !revoke.includes(permission)),
          ...grant,
        ],
      })

      if (result.ok) {
        done.push(userId)
        previous[userId] = result.previous
      } else if (result.error === "GROUP_NOT_FOUND") {
        return c.fail(result.error)
      } else {
        skipped.push({ id: userId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({
      changes: { before: { permissions: previous }, after: { userIds: done, grant, revoke } },
    })

    return c.ok({ done, skipped })
  },
)
