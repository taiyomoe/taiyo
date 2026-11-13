import { adminAudit } from "@taiyomoe/audit"
import {
  AVATAR_BORDERS,
  type CosmeticDefinition,
  NAME_EFFECTS,
  type Role,
  USER_TITLES,
} from "@taiyomoe/db"
import { ROLES } from "@taiyomoe/permissions"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"

// Cosmetics granted by a role the user no longer holds, which equipping would now refuse.
const lockedFor = (catalog: Record<string, CosmeticDefinition>, role: Role) =>
  Object.entries(catalog)
    .filter(([, { unlock }]) => unlock.type === "role" && !unlock.roles.includes(role))
    .map(([key]) => key)
const roleSchema = z.object({
  role: z.enum(ROLES).meta({ description: "The new role.", example: "UPLOADER" }),
})

export const setUserRoleHandler = new Hono().patch(
  "/:id/role",
  describeRoute({
    summary: "Change a user's role",
    description:
      "Gives a user another role. It applies to their very next request. Admins cannot change their own role.\n\n**Required roles:** admin.",
    tags: ["Users"],
    requestBody: {
      content: { "application/json": await resolver(roleSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Role changed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid(), role: z.enum(ROLES) }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  audited(adminAudit.ROLE_SET),
  withAuth(),
  validateJson(roleSchema),
  checkUser({ includeBanned: true }),
  async (c) => {
    const { auth, can, db, targetUser } = c.var
    const { role } = c.var.json

    if (!can("user.setRole", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    c.var.audit.set({ changes: auditChanges(targetUser, { role }) })

    await db.updateTable("users").set({ role }).where("id", "=", targetUser.id).execute()
    await Promise.all([
      db
        .updateTable("users")
        .set({ nameEffect: null })
        .where("id", "=", targetUser.id)
        .where((eb) => {
          const locked = lockedFor(NAME_EFFECTS, role)

          return locked.length === 0 ? eb.lit(false) : eb("nameEffect", "in", locked)
        })
        .execute(),
      db
        .updateTable("users")
        .set({ avatarBorder: null })
        .where("id", "=", targetUser.id)
        .where((eb) => {
          const locked = lockedFor(AVATAR_BORDERS, role)

          return locked.length === 0 ? eb.lit(false) : eb("avatarBorder", "in", locked)
        })
        .execute(),
      db
        .updateTable("userProfiles")
        .set({ title: null })
        .where("userId", "=", targetUser.id)
        .where((eb) => {
          const locked = lockedFor(USER_TITLES, role)

          return locked.length === 0 ? eb.lit(false) : eb("title", "in", locked)
        })
        .execute(),
    ])
    // Better Auth serves its own routes (admin plugin included) from the user cached in each session.
    await refreshUserSessions(auth, targetUser.id)

    return c.ok({ id: targetUser.id, role })
  },
)
