import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteCoverHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a cover",
    description:
      "Removes a cover. The cover can be restored later. The main cover cannot be deleted — promote another cover to main first.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "Cover deleted.",
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
        404: "No cover with the given id exists.",
        409: "The main cover cannot be deleted.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("delete", "Media"),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover, user } = c.var

    if (cover.isMainCover) {
      return c.fail("COVER_IS_MAIN")
    }

    await db
      .updateTable("covers")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", cover.id)
      .execute()

    c.var.afterCommit(() =>
      syncMedia(
        { db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex },
        cover.mediaId,
      ),
    )

    return c.ok({ id: cover.id })
  },
)
