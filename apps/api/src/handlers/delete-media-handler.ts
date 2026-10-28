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

export const deleteMediaHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a media",
    description:
      "Removes a media from listings, search results, and detail endpoints. The media can be restored later.\n\n**Required roles:** uploader, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted media." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        409: "The media has already been deleted.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  audited(mediaAudit.DELETE),
  withAuth("media.delete"),
  checkMedia({ includeDeleted: true }),
  withTransaction,
  async (c) => {
    const { db, media, user } = c.var

    if (media.deletedAt !== null) {
      return c.fail("MEDIA_ALREADY_DELETED")
    }

    await db
      .updateTable("medias")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", media.id)
      .execute()

    return c.ok({ id: media.id })
  },
)
