import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteMediaHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Soft-delete a media",
    description:
      "Marks the media as deleted. It will no longer appear in searches or detail endpoints, but it can be restored later. To permanently remove all associated data, use the dedicated administrative tooling.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Media soft-deleted successfully.",
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
  withAuth("delete", "Media"),
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

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: media.id })
  },
)
