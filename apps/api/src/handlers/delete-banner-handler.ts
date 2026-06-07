import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkBanner } from "../middlewares/check-banner-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteBannerHandler = new Hono().delete(
  "/:id/banners/:bannerId",
  describeRoute({
    summary: "Delete a banner",
    description:
      "Removes a banner from a media. The banner can be restored later.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Banner deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted banner." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No banner with the given id exists under that media.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Media"),
  checkMedia(),
  checkBanner(),
  withTransaction,
  async (c) => {
    const { db, banner, user } = c.var

    await db
      .updateTable("banners")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", banner.id)
      .execute()

    return c.ok({ id: banner.id })
  },
)
