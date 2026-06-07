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

export const setMainCoverHandler = new Hono().post(
  "/:id/covers/:coverId/set-main",
  describeRoute({
    summary: "Set the main cover",
    description:
      "Makes the given cover the main cover for the media, replacing any previous main cover.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Main cover updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the new main cover." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given id exists under that media.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("update", "Media"),
  checkMedia(),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover, media } = c.var

    if (!cover.isMainCover) {
      await db
        .updateTable("covers")
        .set({ isMainCover: false })
        .where("mediaId", "=", media.id)
        .where("isMainCover", "=", true)
        .execute()

      await db.updateTable("covers").set({ isMainCover: true }).where("id", "=", cover.id).execute()
    }

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: cover.id })
  },
)
