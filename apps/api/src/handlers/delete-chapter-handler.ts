import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { requireChapterAccess } from "../middlewares/require-chapter-access-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteChapterHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a chapter",
    description:
      "Removes a chapter. The chapter can be restored later.\n\n**Authentication:** uploader intern, uploader, moderator, admin — or any signed-in member of a group linked to the chapter.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Chapter deleted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the deleted chapter." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  checkChapter(),
  requireChapterAccess,
  withTransaction,
  async (c) => {
    const { db, chapter, user } = c.var

    await db
      .updateTable("chapters")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", chapter.id)
      .execute()

    c.var.afterCommit(() =>
      syncMedia(
        { db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex },
        chapter.mediaId,
      ),
    )

    return c.ok({ id: chapter.id })
  },
)
