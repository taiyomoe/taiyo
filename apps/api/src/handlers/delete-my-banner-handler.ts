import { userAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { removeImage } from "../image-store"
import { audited } from "../middlewares/audited-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteMyBannerHandler = new Hono().delete(
  "/me/banner",
  describeRoute({
    summary: "Remove my profile banner",
    description: "Removes your profile banner.\n\n**Authentication:** signed-in user.",
    tags: ["Profile"],
    responses: {
      200: {
        description: "Banner removed.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ bannerUrl: z.null() }))),
          },
        },
      },
      ...getOpenApiResponses({}),
    },
  }),
  audited(userAudit.BANNER_REMOVE, (c) => ({ id: c.var.user?.id })),
  withAuth(),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const previous = await db
      .selectFrom("userProfiles")
      .select("banner")
      .where("userId", "=", user.id)
      .forUpdate()
      .executeTakeFirst()

    if (previous?.banner !== null && previous?.banner !== undefined) {
      await db
        .updateTable("userProfiles")
        .set({ banner: null })
        .where("userId", "=", user.id)
        .execute()

      removeImage(c.var, previous.banner)
    }

    return c.ok({ bannerUrl: null })
  },
)
