import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const unbanUserHandler = new Hono().post(
  "/:id/unban",
  describeRoute({
    summary: "Lift a user's ban",
    description:
      "Lifts a ban right away. What was rejected because of it stays rejected.\n\n**Required roles:** admin, or moderator for regular users.",
    tags: ["Users"],
    responses: {
      201: {
        description: "Ban lifted.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ id: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No user with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkUser({ includeBanned: true }),
  async (c) => {
    const { can, db, targetUser } = c.var

    if (!can("user.ban", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    await db
      .updateTable("users")
      .set({ banned: false, banReason: null, banExpires: null })
      .where("id", "=", targetUser.id)
      .execute()

    return c.ok({ id: targetUser.id })
  },
)
