import { adminAudit } from "@taiyomoe/audit"
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
import { apiSuccessEnvelope } from "../utils/schemas"

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
    const { can, db, targetUser } = c.var
    const { role } = c.var.json

    if (!can("user.setRole", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    c.var.audit.set({ changes: auditChanges(targetUser, { role }) })

    await db.updateTable("users").set({ role }).where("id", "=", targetUser.id).execute()

    return c.ok({ id: targetUser.id, role })
  },
)
