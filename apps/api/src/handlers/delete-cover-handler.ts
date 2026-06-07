import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteCoverHandler = new Hono().delete(
  "/:id/covers/:coverId",
  describeRoute({
    summary: "Soft-delete a cover",
    description:
      "Marks the cover as deleted. It will no longer appear in listings or detail endpoints, but the underlying file is retained so it can be restored later. The main cover cannot be deleted; promote another cover first.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Cover soft-deleted successfully.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted cover." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given id exists under that media.",
        409: "The main cover cannot be deleted.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Media"),
  checkMedia(),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover, media, user } = c.var

    if (cover.isMainCover) {
      return c.fail("COVER_IS_MAIN")
    }

    await db
      .updateTable("covers")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", cover.id)
      .execute()

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: cover.id })
  },
)
