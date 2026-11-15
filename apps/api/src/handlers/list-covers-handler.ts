import { getCoverUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, storedLanguageSchema } from "../utils/schemas"

const coverSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  url: z.url().meta({
    description: "The URL of the cover image.",
    example:
      "https://cdn.taiyo.moe/medias/4e26b80f-6661-4f5f-93b4-6dfed052bbed/covers/a56cc54d-7776-4787-9b21-97a4674b80bc.jpg",
  }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume the cover belongs to, if any.", example: "1" }),
  language: storedLanguageSchema("The language of the cover."),
  contentRating: contentRatingSchema("The content rating of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether the cover is the main cover of the media.", example: true }),
  createdAt: z.iso.datetime().meta({ description: "When the cover was uploaded." }),
  updatedAt: z.iso.datetime().meta({ description: "When the cover was last updated." }),
})

export const listCoversHandler = new Hono().get(
  "/:id/covers",
  describeRoute({
    summary: "List a media's covers",
    description: "Lists the covers of a media, oldest first.\n\n**Authentication:** none.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "The covers of the media.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(coverSchema.array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
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
        "extension",
        "volume",
        "language",
        "contentRating",
        "isMainCover",
        "createdAt",
        "updatedAt",
      ])
      .where("mediaId", "=", media.id)
      .where("deletedAt", "is", null)
      .orderBy("createdAt", "asc")
      .orderBy("id", "asc")
      .execute()

    return c.ok(
      covers.map(({ extension, ...cover }) => ({
        ...cover,
        url: getCoverUrl(media.id, cover.id, extension),
      })),
    )
  },
)
