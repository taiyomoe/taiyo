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
      "Removes every version of this chapter number from your history, so the number shows as unread again. Points already earned for it are kept and are not earned a second time.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Chapter marked as unread.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.object({ chapterId: z.uuid() }))),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        422: "The provided id is not a valid UUID.",
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
