import { adminAudit } from "@taiyomoe/audit"
import { ROLES } from "@taiyomoe/permissions"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeUser } from "../middlewares/authorize-user-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"
import { setUsersRole } from "../utils/user-role"

const roleSchema = z.object({
  role: z.enum(ROLES).meta({ description: "The new role of the user.", example: "UPLOADER" }),
})

export const setUserRoleHandler = new Hono().patch(
  "/:id/role",
  describeRoute({
    summary: "Set a user's role",
    description:
      "Sets the role of a user. It applies to their very next request, and the cosmetics the new role does not unlock are unequipped. You cannot change your own role.\n\n**Required roles:** admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Role set.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the user." }),
                  role: z
                    .enum(ROLES)
                    .meta({ description: "The new role of the user.", example: "UPLOADER" }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not an admin, or you are trying to change your own role.",
        404: "No user with the given ID exists.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
      }),
    },
  }),
  audited(adminAudit.ROLE_SET),
  withAuth(),
  authorizeUser("setRole"),
  validateJson(roleSchema),
  checkUser({ includeBanned: true }),
  async (c) => {
    const { auth, db, targetUser } = c.var
    const { role } = c.var.json

    c.var.audit.set({ changes: auditChanges(targetUser, { role }) })

    await setUsersRole(db, [targetUser.id], role)
    // Better Auth serves its own routes (admin plugin included) from the user cached in each session.
    await refreshUserSessions(auth, targetUser.id)

    return c.ok({ id: targetUser.id, role })
  },
)
