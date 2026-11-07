import { userAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"
import { getOwnedAvatarKey } from "./update-my-avatar-handler"

export const deleteMyAvatarHandler = new Hono().delete(
  "/me/avatar",
  describeRoute({
    summary: "Remove my avatar",
    description:
      "Removes your avatar, so your initial shows instead.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Avatar removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ image: z.null() }))),
          },
        },
      },
      ...getOpenApiResponses({}),
    },
  }),
  audited(userAudit.AVATAR_REMOVE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  withTransaction,
  async (c) => {
    const { auth, db, user } = c.var
    const key = getOwnedAvatarKey(user.id, user.image ?? null)

    await db.updateTable("users").set({ image: null }).where("id", "=", user.id).execute()

    if (key !== null) {
      removeImage(c.var, key)
    }

    c.var.afterCommit(() => refreshUserSessions(auth, user.id))

    return c.ok({ image: null })
  },
)
