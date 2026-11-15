import { getCoverUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, storedLanguageSchema } from "../utils/schemas"

const coverDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  mediaId: z.uuid().meta({ description: "The ID of the media the cover belongs to." }),
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
    .meta({ description: "Whether the cover is the main cover of its media.", example: true }),
  createdAt: z.iso.datetime().meta({ description: "When the cover was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the cover was last updated." }),
})

export const getCoverHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a cover",
    description: "Returns a cover by ID.\n\n**Authentication:** none.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "The cover.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(coverDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  checkCover(),
  (c) => {
    const { cover } = c.var

    return c.ok({
      id: cover.id,
      mediaId: cover.mediaId,
      url: getCoverUrl(cover.mediaId, cover.id, cover.extension),
      volume: cover.volume,
      language: cover.language,
      contentRating: cover.contentRating,
      isMainCover: cover.isMainCover,
      createdAt: cover.createdAt,
      updatedAt: cover.updatedAt,
    })
  },
)
