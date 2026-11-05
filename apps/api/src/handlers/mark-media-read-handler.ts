import { sql } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { selectReadChapterNumber } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const markMediaReadHandler = new Hono().put(
  "/:id/read",
  describeRoute({
    summary: "Mark every chapter of a media as read",
    description:
      "Marks every published chapter number of the media as finished: chapters you opened are completed, and one version of each number you never opened is added to your history. Marking chapters as read never earns points, and they stay out of your reading-history feed.\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    responses: {
      200: {
        description: "Chapters marked as read.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  marked: z
                    .int()
                    .meta({ description: "How many history entries were added or completed." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, user, media } = c.var
    const published = db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", media.id)
      .where("status", "=", "PUBLISHED")
      .where("deletedAt", "is", null)
    const completed = await db
      .updateTable("userHistories")
      .set({ completed: true })
      .where("userId", "=", user.id)
      .where("completed", "=", false)
      .where("chapterId", "in", published)
      .executeTakeFirst()
    const inserted = await db
      .insertInto("userHistories")
      .columns(["userId", "chapterId", "completed"])
      .expression((eb) =>
        eb
          .selectFrom("chapters")
          .distinctOn("chapters.number")
          .select((inner) => [
            sql<string>`${user.id}::uuid`.as("userId"),
            "chapters.id as chapterId",
            inner.lit(true).as("completed"),
          ])
          .where("chapters.mediaId", "=", media.id)
          .where("chapters.status", "=", "PUBLISHED")
          .where("chapters.deletedAt", "is", null)
          .where((inner) => inner.not(inner.exists(selectReadChapterNumber(db, user.id))))
          .orderBy("chapters.number")
          .orderBy("chapters.createdAt"),
      )
      .executeTakeFirst()

    return c.ok({
      marked: Number(completed.numUpdatedRows) + Number(inserted.numInsertedOrUpdatedRows ?? 0n),
    })
  },
)
