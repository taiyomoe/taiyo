import { groupMemberAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeGroupMember } from "../group-membership"
import { audited } from "../middlewares/audited-middleware"
import { authorizeGroup } from "../middlewares/authorize-group-middleware"
import { checkGroup } from "../middlewares/check-group-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const removeMembersSchema = z.object({
  userIds: bulkIdsSchema("members", [
    "0d3c5b9e-7f1a-4c2e-9b8d-6a5f4e3d2c1b",
    "a7e2f9c4-1b3d-4e5f-8a6b-9c0d1e2f3a4b",
  ]),
})
const skippedMemberSchema = skippedSchema(
  "member",
  ["NOT_FOUND", "FORBIDDEN"],
  "Why the member was left alone: the user is not a member of the group, or you cannot remove them.",
)
const SKIP_REASONS = {
  GROUP_MEMBER_NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  GROUP_LAST_OWNER: "FORBIDDEN",
} as const

export const removeGroupMembersHandler = new Hono().delete(
  "/:id/members",
  describeRoute({
    summary: "Remove members from a group in bulk",
    description:
      "Removes several members from the group at once, exactly as removing each of them does. Members you cannot remove and users who are not members of the group are skipped and reported.\n\n**Required access:** the group owner, a member with the `MANAGE_MEMBERS` permission, or admin.",
    tags: ["Group members"],
    responses: {
      200: {
        description: "The removed and skipped members.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("members", "removed", skippedMemberSchema)),
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
  audited(groupMemberAudit.REMOVE_MANY),
  withAuth(),
  checkGroup(),
  authorizeGroup("manageMembers"),
  validateJson(removeMembersSchema),
  withTransaction,
  async (c) => {
    const { actor, db, group } = c.var
    const done: string[] = []
    const skipped: Array<z.infer<typeof skippedMemberSchema>> = []

    for (const userId of c.var.json.userIds) {
      const result = await removeGroupMember(db, { actor, groupId: group.id, userId })

      if (result.ok) {
        done.push(userId)
      } else if (result.error === "GROUP_NOT_FOUND") {
        return c.fail(result.error)
      } else {
        skipped.push({ id: userId, reason: SKIP_REASONS[result.error] })
      }
    }

    c.var.audit.set({ changes: { after: { userIds: done } } })

    return c.ok({ done, skipped })
  },
)
