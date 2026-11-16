import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { mangaDexSyncItemSchema, mangaDexSyncSchema } from "../utils/mangadex-sync-schemas"
import { readMangaDexSyncs } from "../utils/mangadex-syncs"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({ id: z.uuid().meta({ description: "The ID of the sync." }) })

export const getMangaDexSyncHandler = new Hono().get(
  "/:id",
  describeRoute({
    summary: "Get a MangaDex sync",
    description:
      "Returns a MangaDex sync with each of its covers and chapters, in import order.\n\n**Required roles:** uploader, admin.",
    tags: ["MangaDex sync"],
    responses: {
      200: {
        description: "The sync.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                mangaDexSyncSchema.extend({
                  items: mangaDexSyncItemSchema.array().meta({
                    description: "The covers and chapters of the sync.",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No sync with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth("media.syncMangaDex"),
  validateParam(paramSchema),
  async (c) => {
    const { db } = c.var
    const [sync] = await readMangaDexSyncs(db, { id: c.var.param.id })

    if (sync === undefined) {
      return c.fail("MANGADEX_SYNC_NOT_FOUND")
    }

    const items = await db
      .selectFrom("mangaDexSyncItems")
      .select(["id", "kind", "mangaDexId", "status", "error", "entityId", "details"])
      .where("syncId", "=", sync.id)
      .orderBy("position")
      .execute()

    return c.ok({ ...sync, items })
  },
)
