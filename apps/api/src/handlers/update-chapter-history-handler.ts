import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const updateHistorySchema = z
  .object({
    pageId: z
      .uuid()
      .nullable()
      .optional()
      .meta({ description: "ID of the page currently being viewed, or null to clear." }),
    completed: z.boolean().optional().meta({ description: "Mark the chapter as fully read." }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateChapterHistoryHandler = new Hono().patch(
  "/:id/history",
  describeRoute({
    summary: "Update reading progress for a chapter",
    description:
      "Updates your progress on this chapter — last page viewed, completed flag. Requires the chapter to already be in your history (via POST /chapters/:id/open).\n\n**Authentication:** signed-in user.",
    tags: ["Reading history"],
    requestBody: {
      content: { "application/json": await resolver(updateHistorySchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Progress updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(z.object({ userId: z.uuid(), chapterId: z.uuid() })),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists, or you haven't opened it yet.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "History"),
  validateJson(updateHistorySchema),
  checkChapter(),
  withTransaction,
  async (c) => {
    const { db, user, chapter } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}

    if (body.pageId !== undefined) {
      updates.pageId = body.pageId
    }

    if (body.completed !== undefined) {
      updates.completed = body.completed
    }

    const result = await db
      .updateTable("userHistories")
      .set(updates)
      .where("userId", "=", user.id)
      .where("chapterId", "=", chapter.id)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return c.fail("HISTORY_ENTRY_NOT_FOUND")
    }

    return c.ok({ userId: user.id, chapterId: chapter.id })
  },
)
