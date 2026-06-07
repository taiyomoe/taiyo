import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkBanner } from "../middlewares/check-banner-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const updateBannerSchema = z.object({
  contentRating: contentRatingSchema("The content rating of the banner."),
})

export const updateBannerHandler = new Hono().patch(
  "/:id/banners/:bannerId",
  describeRoute({
    summary: "Update a banner's metadata",
    description: "Updates the content rating of an existing banner.",
    tags: ["Medias/Banners"],
    requestBody: {
      content: { "application/json": await resolver(updateBannerSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Banner updated successfully.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated banner." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No banner with the given id exists under that media.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateJson(updateBannerSchema),
  checkMedia(),
  checkBanner(),
  withTransaction,
  async (c) => {
    const { db, banner } = c.var
    const { contentRating } = c.var.json

    await db.updateTable("banners").set({ contentRating }).where("id", "=", banner.id).execute()

    return c.ok({ id: banner.id })
  },
)
