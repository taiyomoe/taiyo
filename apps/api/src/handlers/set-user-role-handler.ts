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
import { authorizeUser } from "../middlewares/authorize-user-middleware"
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
