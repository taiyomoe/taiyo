import { historyAudit } from "@taiyomoe/audit"
import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const openChapterHandler = new Hono().post(
  "/:id/open",
  describeRoute({
    summary: "Open a chapter",
    description:
      "Opens a published chapter in your history, so it shows up in your reading history feed. Opening it again moves it back to the top.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      201: {
        description: "Chapter opened.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  userId: z.uuid().meta({ description: "Your user ID." }),
                  chapterId: z.uuid().meta({ description: "The ID of the chapter." }),
                }),
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
  audited(historyAudit.CHAPTER_OPEN),
  withAuth(),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var

    await db
      .insertInto("userHistories")
      .values({ userId: user.id, chapterId: chapter.id })
      .onConflict((oc) =>
        oc.columns(["userId", "chapterId"]).doUpdateSet({ updatedAt: sql`CURRENT_TIMESTAMP` }),
      )
      .execute()

    return c.ok({ userId: user.id, chapterId: chapter.id })
  },
)
