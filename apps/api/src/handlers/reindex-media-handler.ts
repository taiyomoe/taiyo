import { mediaAudit } from "@taiyomoe/audit"
import { drainSearchOutbox } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const reindexMediaHandler = new Hono().post(
  "/:id/reindex",
  describeRoute({
    summary: "Refresh a media in search",
    description:
      "Refreshes the media in search, so search results reflect its current state.\n\n**Required roles:** admin.",
    tags: ["Medias"],
    responses: {
      201: {
        description: "Media refreshed in search.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the media." }),
                }),
              ),
            ),
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
  audited(mediaAudit.REINDEX),
  withAuth("media.reindex"),
  checkMedia(),
  async (c) => {
    const { db, meili, mediasIndex, media } = c.var

    await db.insertInto("searchOutbox").values({ mediaId: media.id }).execute()
    await drainSearchOutbox({ db, meili, mediasIndex }, { limit: Number.POSITIVE_INFINITY })

    return c.ok({ id: media.id })
  },
)
