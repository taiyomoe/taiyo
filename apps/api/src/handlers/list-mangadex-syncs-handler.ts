import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { mangaDexSyncSchema } from "../utils/mangadex-sync-schemas"
import { readMangaDexSyncs } from "../utils/mangadex-syncs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const listMangaDexSyncsHandler = new Hono().get(
  "/:id/mangadex-syncs",
  describeRoute({
    summary: "List a media's MangaDex syncs",
    description: `Lists the ${config.mangaDex.recentSyncs} latest MangaDex syncs of a media, newest first.\n\n**Required roles:** uploader, admin.`,
    tags: ["MangaDex sync"],
    responses: {
      200: {
        description: "The latest syncs of the media.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mangaDexSyncSchema.array())),
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
  withAuth("media.syncMangaDex"),
  checkMedia(),
  async (c) =>
    c.ok(
      await readMangaDexSyncs(c.var.db, {
        mediaId: c.var.media.id,
        limit: config.mangaDex.recentSyncs,
      }),
    ),
)
