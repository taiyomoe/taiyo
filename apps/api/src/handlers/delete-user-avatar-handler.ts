import { adminAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { authorizeUser } from "../middlewares/authorize-user-middleware"
import { checkUser } from "../middlewares/check-user-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { auditChanges } from "../utils/audit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { refreshUserSessions } from "../utils/refresh-sessions"
import { apiSuccessEnvelope } from "../utils/schemas"
import { getOwnedAvatarKey } from "./update-my-avatar-handler"

export const deleteUserAvatarHandler = new Hono().delete(
  "/:id/avatar",
  describeRoute({
    summary: "Remove a user's avatar",
    description:
      "Removes the avatar of a user, so the user's initial shows instead. Removing an avatar the user does not have does nothing. Moderators can only edit users with the `USER` role, and you cannot remove your own avatar this way.\n\n**Required roles:** moderator, admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Avatar removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the user." }),
                  image: z.null().meta({ description: "The URL of the user's avatar, now null." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: "You are not a moderator or admin, you are a moderator and the user is not a regular user, or the user is you.",
        404: "No user with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(adminAudit.USER_AVATAR_REMOVE),
  withAuth(),
  authorizeUser("moderateProfile"),
  checkUser({ includeBanned: true }),
  withTransaction,
  async (c) => {
    const { auth, can, db, targetUser } = c.var

    if (!can("user.moderateProfile", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    const key = getOwnedAvatarKey(targetUser.id, targetUser.image)

    c.var.audit.set({ changes: auditChanges(targetUser, { image: null }) })

    await db.updateTable("users").set({ image: null }).where("id", "=", targetUser.id).execute()

    if (key !== null) {
      removeImage(c.var, key)
    }

    c.var.afterCommit(() => refreshUserSessions(auth, targetUser.id))

    return c.ok({ id: targetUser.id, image: null })
  },
)
