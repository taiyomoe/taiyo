import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, languageSchema } from "../utils/schemas"

const coverDetailSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the cover." }),
  mediaId: z.uuid().meta({ description: "The ID of the media this cover belongs to." }),
  volume: z
    .string()
    .nullable()
    .meta({ description: "The volume this cover represents, if any.", example: "1" }),
  language: languageSchema("The language of the cover."),
  contentRating: contentRatingSchema("The content rating of the cover."),
  isMainCover: z
    .boolean()
    .meta({ description: "Whether this is the main cover of the media.", example: true }),
  createdAt: z.iso.datetime().meta({ description: "When the cover was created." }),
  updatedAt: z.iso.datetime().meta({ description: "When the cover was last updated." }),
})

export const getCoverHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a cover",
    description: "Fetches a cover by id.\n\n**Authentication:** none.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "Cover details.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(coverDetailSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  checkCover(),
  async (c) => {
    const { cover } = c.var

    return c.ok({
      id: cover.id,
      mediaId: cover.mediaId,
      volume: cover.volume,
      language: cover.language,
      contentRating: cover.contentRating,
      isMainCover: cover.isMainCover,
      createdAt: cover.createdAt,
      updatedAt: cover.updatedAt,
    })
  },
)
