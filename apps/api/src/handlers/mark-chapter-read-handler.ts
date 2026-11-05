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

export const markChapterReadHandler = new Hono().put(
  "/:id/read",
  describeRoute({
    summary: "Mark a chapter as read",
    description:
      "Marks the chapter as finished in your history without opening it. Marking a chapter as read never earns points, and chapters you only marked as read stay out of your reading-history feed.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Chapter marked as read.",
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
  audited(historyAudit.CHAPTER_MARK_READ),
  withAuth(),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var

    await db
      .insertInto("userHistories")
      .values({ userId: user.id, chapterId: chapter.id, completed: true })
      .onConflict((oc) => oc.columns(["userId", "chapterId"]).doUpdateSet({ completed: true }))
      .execute()

    return c.ok({ chapterId: chapter.id })
  },
)
