import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getMediaDeletionImpact, mediaDeletionCountsSchema } from "../utils/media-deletion-impact"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const mediaDeletionImpactSchema = mediaDeletionCountsSchema.extend({
  featured: z
    .boolean()
    .meta({ description: "Whether the media is featured on the home page.", example: false }),
})

export const getMediaDeletionImpactHandler = new Hono().get(
  "/:id/deletion-impact",
  describeRoute({
    summary: "Get what deleting a media affects",
    description:
      "Returns what disappears from the site if you delete the media: its chapters, images, library entries, list items, reading history, comments, suggestions and reports, counted.\n\n**Required roles:** uploader, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "What deleting the media affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth("media.delete"),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const { featured, ...impact } = await getMediaDeletionImpact(db, [media.id])

    return c.ok({ ...impact, featured: featured > 0 })
  },
)
