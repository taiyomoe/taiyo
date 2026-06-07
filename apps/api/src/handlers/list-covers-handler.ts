import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, languageSchema } from "../utils/schemas"

const coverSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume this cover represents, if any.", example: "1" }),
  language: languageSchema("The language of the cover."),
  contentRating: contentRatingSchema("The content rating of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether this is the main cover of the media.", example: true }),
  createdAt: z.iso.datetime().meta({ description: "When the cover was uploaded." }),
  updatedAt: z.iso.datetime().meta({ description: "When the cover was last modified." }),
})

export const listCoversHandler = new Hono().get(
  "/:id/covers",
  describeRoute({
    summary: "List the covers of a media",
    description:
      "Returns every non-deleted cover belonging to the media, including the volume, language, content rating and main-cover flag.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Covers listed successfully.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(coverSchema.array())),
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
    const covers = await db
      .selectFrom("covers")
      .select([
        "id",
        "volume",
        "language",
        "contentRating",
        "isMainCover",
        "createdAt",
        "updatedAt",
      ])
      .where("mediaId", "=", media.id)
      .where("deletedAt", "is", null)
      .execute()

    return c.ok(covers)
  },
)
