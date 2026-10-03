import { getBannerUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkBanner } from "../middlewares/check-banner-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const bannerDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
  mediaId: z.uuid().meta({ description: "The ID of the media this banner belongs to." }),
  url: z.url().meta({
    description: "URL of the banner image.",
    example:
      "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/banners/8f2c1d7e-5a3b-4c9d-b1e0-6a7f8d9c0b1a.jpg",
  }),
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
      url: getBannerUrl(banner.mediaId, banner.id, banner.extension),
      contentRating: banner.contentRating,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    })
  },
)
