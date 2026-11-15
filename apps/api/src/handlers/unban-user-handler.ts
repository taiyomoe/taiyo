import { adminAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const unbanUserHandler = new Hono().post(
  "/:id/unban",
  describeRoute({
    summary: "Unban a user",
    description:
      "Unbans a user right away. What was rejected because of the ban stays rejected. Moderators can only unban users with the `USER` role, and you cannot unban yourself.\n\n**Required roles:** moderator, admin.",
    tags: ["Users"],
    responses: {
      201: {
        description: "User unbanned.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ id: z.uuid().meta({ description: "The ID of the user." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not a moderator or admin, the user is you, or you are a moderator and the user is not a regular user.",
        404: "No user with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(adminAudit.USER_UNBAN),
  withAuth(),
  checkUser({ includeBanned: true }),
  async (c) => {
    const { can, db, targetUser } = c.var

    if (!can("user.ban", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    c.var.audit.set({
      changes: auditChanges(targetUser, { banned: false, banReason: null, banExpires: null }),
    })

    await db
      .updateTable("users")
      .set({ banned: false, banReason: null, banExpires: null })
      .where("id", "=", targetUser.id)
      .execute()

    return c.ok({ id: targetUser.id })
  },
)
