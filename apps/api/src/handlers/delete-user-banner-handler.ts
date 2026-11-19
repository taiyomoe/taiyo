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
import { notifyModeration } from "../utils/notifications"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteUserBannerHandler = new Hono().delete(
  "/:id/banner",
  describeRoute({
    summary: "Remove a user's profile banner",
    description:
      "Removes the profile banner of a user and notifies the user. Removing a banner the user does not have does nothing. Moderators can only edit users with the `USER` role, and you cannot remove your own banner this way.\n\n**Required roles:** moderator, admin.",
    tags: ["Users"],
    responses: {
      200: {
        description: "Banner removed.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the user." }),
                  bannerUrl: z
                    .null()
                    .meta({ description: "The URL of the user's profile banner, now null." }),
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
  audited(adminAudit.USER_BANNER_REMOVE),
  withAuth(),
  authorizeUser("moderateProfile"),
  checkUser({ includeBanned: true }),
  withTransaction,
  async (c) => {
    const { can, db, targetUser } = c.var

    if (!can("user.moderateProfile", { id: targetUser.id, role: targetUser.role })) {
      return c.fail("FORBIDDEN")
    }

    const previous = await db
      .selectFrom("userProfiles")
      .select("banner")
      .where("userId", "=", targetUser.id)
      .forUpdate()
      .executeTakeFirst()

    if (previous?.banner !== null && previous?.banner !== undefined) {
      c.var.audit.set({ changes: auditChanges(previous, { banner: null }) })

      await db
        .updateTable("userProfiles")
        .set({ banner: null })
        .where("userId", "=", targetUser.id)
        .execute()

      removeImage(c.var, previous.banner)
      await notifyModeration(c.var, [
        { type: "PROFILE_MODERATED", userId: targetUser.id, payload: { fields: ["banner"] } },
      ])
    }

    return c.ok({ id: targetUser.id, bannerUrl: null })
  },
)
