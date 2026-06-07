import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const bannerSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the banner." }),
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
    tags: ["Medias"],
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
      .select(["id", "contentRating", "createdAt", "updatedAt"])
      .where("mediaId", "=", media.id)
      .where("deletedAt", "is", null)
      .execute()

    return c.ok(banners)
  },
)
