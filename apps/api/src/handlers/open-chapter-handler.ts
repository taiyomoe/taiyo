import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
      "Records that you've opened this chapter. Subsequent calls bump the timestamp; the chapter shows up in your reading-history feed.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      201: {
        description: "History entry upserted.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ userId: z.uuid(), chapterId: z.uuid() })),
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
  withAuth("create", "History"),
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
