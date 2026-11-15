import { historyAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const markChapterUnreadHandler = new Hono().delete(
  "/:id/read",
  describeRoute({
    summary: "Mark a chapter as unread",
    description:
      "Marks a published chapter as unread by removing every version of its number from your history, in any language. Points already earned for it are kept and cannot be earned a second time.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Chapter marked as unread.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({ chapterId: z.uuid().meta({ description: "The ID of the chapter." }) }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  audited(historyAudit.CHAPTER_MARK_UNREAD),
  withAuth(),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var

    await db
      .deleteFrom("userHistories")
      .where("userId", "=", user.id)
      .where("chapterId", "in", (eb) =>
        eb
          .selectFrom("chapters")
          .select("id")
          .where("mediaId", "=", chapter.mediaId)
          .where("number", "=", chapter.number),
      )
      .execute()

    return c.ok({ chapterId: chapter.id })
  },
)
