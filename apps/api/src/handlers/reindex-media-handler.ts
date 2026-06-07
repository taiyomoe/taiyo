import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const reindexMediaHandler = new Hono().post(
  "/:id/reindex",
  describeRoute({
    summary: "Force a media to be reindexed in search",
    description:
      "Recomputes the media's search document and pushes it to the search index. Use this when search results look stale after a backfill or out-of-band data fix.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media reindexed successfully.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the reindexed media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("update", "Media"),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var

    await syncMedia(db, media.id)

    return c.ok({ id: media.id })
  },
)
