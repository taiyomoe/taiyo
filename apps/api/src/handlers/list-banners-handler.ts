import { getBannerUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const bannerSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
  url: z.url().meta({
    description: "URL of the banner image.",
    example:
      "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/banners/8f2c1d7e-5a3b-4c9d-b1e0-6a7f8d9c0b1a.jpg",
  }),
  contentRating: contentRatingSchema("The content rating of the banner."),
  createdAt: z.iso.datetime().meta({ description: "When the banner was uploaded." }),
  updatedAt: z.iso.datetime().meta({ description: "When the banner was last modified." }),
})

export const listBannersHandler = new Hono().get(
  "/:id/banners",
  describeRoute({
    summary: "List a media's banners",
    description:
      "Lists the banners attached to a media, with their content rating.\n\n**Authentication:** none.",
    tags: ["Banners"],
    responses: {
      200: {
        description: "Banners of the media.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(bannerSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const banners = await db
      .selectFrom("banners")
      .select(["id", "extension", "contentRating", "createdAt", "updatedAt"])
      .where("mediaId", "=", media.id)
      .where("deletedAt", "is", null)
      .execute()

    return c.ok(
      banners.map(({ extension, ...banner }) => ({
        ...banner,
        url: getBannerUrl(media.id, banner.id, extension),
      })),
    )
  },
)
