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
    summary: "List the banners of a media",
    description:
      "Returns every non-deleted banner belonging to the media, along with its content rating.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Banners listed successfully.",
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
