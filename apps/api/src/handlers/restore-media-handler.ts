import { mediaAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const restoreMediaHandler = new Hono().post(
  "/:id/restore",
  describeRoute({
    summary: "Restore a deleted media",
    description:
      "Restores a previously deleted media so that it appears in listings, search results, and detail endpoints again.\n\n**Required roles:** moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media restored.",
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
  audited(mediaAudit.RESTORE),
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

    return c.ok({ id: media.id })
  },
)
