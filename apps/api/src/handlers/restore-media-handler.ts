import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const restoreMediaHandler = new Hono().post(
  "/:id/restore",
  describeRoute({
    summary: "Restore a soft-deleted media",
    description: "Reverses a prior soft-delete, making the media visible again.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media restored successfully.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the restored media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        409: "The media is not in a deleted state.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("manage", "Media"),
  checkMedia({ includeDeleted: true }),
  withTransaction,
  async (c) => {
    const { db, media } = c.var

    if (media.deletedAt === null) {
      return c.fail("MEDIA_NOT_DELETED")
    }

    await db
      .updateTable("medias")
      .set({ deletedAt: null, deleterId: null })
      .where("id", "=", media.id)
      .execute()

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: media.id })
  },
)
