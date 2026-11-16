import { adminAudit } from "@taiyomoe/audit"
import { ROLES } from "@taiyomoe/permissions"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeUser } from "../middlewares/authorize-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"
import { setUsersRole } from "../utils/user-role"

const setUsersRoleSchema = z.object({
  userIds: bulkIdsSchema("users", [
    "0d3c5b9e-7f1a-4c2e-9b8d-6a5f4e3d2c1b",
    "a7e2f9c4-1b3d-4e5f-8a6b-9c0d1e2f3a4b",
  ]),
  role: z.enum(ROLES).meta({ description: "The new role of the users.", example: "UPLOADER" }),
})
const skippedUserSchema = skippedSchema(
  "user",
  ["NOT_FOUND", "SELF", "FORBIDDEN"],
  "Why the user was left alone: it does not exist, it is you, or you cannot change its role.",
)

export const setUsersRoleHandler = new Hono().patch(
  "/role",
  describeRoute({
    summary: "Set the role of users in bulk",
    description:
      "Sets the same role on several users at once, exactly as setting each user's role does: it applies to their very next request, and the cosmetics the new role does not unlock are unequipped. Users who already have the role count as updated. Users that do not exist, your own account and users whose role you cannot change are skipped and reported.\n\n**Required roles:** admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "The updated and skipped users.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("users", "updated", skippedUserSchema)),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(adminAudit.ROLE_SET_MANY),
  withAuth(),
  authorizeUser("setRole"),
  validateJson(setUsersRoleSchema),
  withTransaction,
  async (c) => {
    const { auth, can, db, user } = c.var
    const { userIds, role } = c.var.json
    const rows = await db
      .selectFrom("users")
      .select(["id", "role"])
      .where("id", "in", userIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(userIds, rows)
    const getSkipReason = (id: string) => {
      if (id === user.id) {
        return "SELF" as const
      }

      return can("user.setRole", { id }) ? null : ("FORBIDDEN" as const)
    }
    const allowed = found.filter((row) => getSkipReason(row.id) === null)
    const done = allowed.map((row) => row.id)

    await setUsersRole(db, done, role)

    // Better Auth serves its own routes (admin plugin included) from the user cached in each session.
    c.var.afterCommit(async () => {
      await Promise.all(done.map((id) => refreshUserSessions(auth, id)))
    })
    c.var.audit.set({
      changes: {
        before: { roles: Object.fromEntries(allowed.map((row) => [row.id, row.role])) },
        after: { userIds: done, role },
      },
    })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found.flatMap((row) => {
          const reason = getSkipReason(row.id)

          return reason === null ? [] : [{ id: row.id, reason }]
        }),
      ],
    })
  },
)
