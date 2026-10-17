import { chapterAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const deleteChapterHandler = new Hono().delete(
  "/:id",
  describeRoute({
    summary: "Delete a chapter",
    description:
      "Removes a chapter. The chapter can be restored later.\n\n**Authentication:** uploader, moderator, admin — or a member with `DELETE_CHAPTERS` in a group credited on the chapter.",
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
  audited(chapterAudit.DELETE),
  withAuth(),
  checkChapter({ unpublished: true }),
  authorizeChapter("delete"),
  withTransaction,
  async (c) => {
    const { db, chapter, user } = c.var

    c.var.audit.set({ target: { mediaId: chapter.mediaId } })

    await db
      .updateTable("chapters")
      .set({ deletedAt: new Date(), deleterId: user.id })
      .where("id", "=", chapter.id)
      .execute()

    return c.ok({ id: chapter.id })
  },
)
