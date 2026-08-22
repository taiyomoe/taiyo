import type { ChapterUploadManifest } from "@taiyomoe/queue"
import { TASK_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { requireChapterAccess } from "../middlewares/require-chapter-access-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const getChapterUploadStatusQuerySchema = z.object({
  taskId: z.uuid().meta({
    description: "Task ID returned when the upload session was opened.",
    example: crypto.randomUUID(),
  }),
})

export const getChapterUploadStatusHandler = new Hono().get(
  "/:id/pages/status",
  describeRoute({
    summary: "Get chapter upload status",
    description:
      "Returns the current status of a chapter page upload task.\n\n**Authentication:** uploader intern, uploader, moderator, admin — or any signed-in member of a group linked to the chapter.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Upload task status.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({ description: "ID of the upload task." }),
                  status: z
                    .enum(TASK_STATUSES)
                    .meta({ description: "Current processing status.", example: "PENDING" }),
                  pageCount: z
                    .int()
                    .nonnegative()
                    .meta({ description: "Total number of pages in this upload.", example: 20 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No pending upload session was found for this chapter.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("read", "OwnershipRequest"),
  validateQuery(getChapterUploadStatusQuerySchema),
  checkChapter(),
  requireChapterAccess,
  async (c) => {
    const { db, chapter } = c.var
    const { taskId } = c.var.query
    const task = await db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", taskId)
      .where("type", "=", "UPLOAD_CHAPTER")
      .executeTakeFirst()

    if (!task || (task.payload as ChapterUploadManifest).chapterId !== chapter.id) {
      return c.fail("CHAPTER_UPLOAD_SESSION_NOT_FOUND")
    }

    return c.ok({
      taskId,
      status: task.status,
      pageCount: (task.payload as ChapterUploadManifest).pages.length,
    })
  },
)
