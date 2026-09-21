import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkBanner } from "../middlewares/check-banner-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const bannerDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
  mediaId: z.uuid().meta({ description: "The ID of the media this banner belongs to." }),
  contentRating: contentRatingSchema("The content rating of the banner."),
  createdAt: z.iso.datetime().meta({ description: "When the banner was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the banner was last updated." }),
})

export const getBannerHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a banner",
    description: "Fetches a banner by id.\n\n**Authentication:** none.",
    tags: ["Banners"],
    responses: {
      200: {
        description: "Banner details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(bannerDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No banner with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkBanner(),
  async (c) => {
    const { banner } = c.var

    return c.ok({
      id: banner.id,
      mediaId: banner.mediaId,
      contentRating: banner.contentRating,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    })
  },
)
