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
    summary: "Refresh a media in search",
    description:
      "Refreshes the media's representation in search so that results reflect its current state.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Search representation refreshed.",
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
    const { db, meili, mediasIndex, media } = c.var

    await syncMedia({ db, meili, mediasIndex }, media.id)

    return c.ok({ id: media.id })
  },
)
