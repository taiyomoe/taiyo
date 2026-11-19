import { TASK_STATUSES } from "@taiyomoe/db"
import { chapterUploadManifestSchema } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const getChapterUploadStatusQuerySchema = z.object({
  taskId: z.uuid().meta({
    description: "The ID of the upload task returned when the upload session was opened.",
    example: "6f0c2e1a-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
  }),
})

export const getChapterUploadStatusHandler = new Hono().get(
  "/:id/pages/status",
  describeRoute({
    summary: "Get the status of a chapter upload",
    description:
      "Returns the processing status of a chapter page upload. Pages are ready once the status is `FINISHED`.\n\n**Required access:** uploader or admin, a moderator, the uploader intern who uploaded it or a member of a credited group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading, pending or scheduled.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The status of the upload.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({
                    description: "The ID of the upload task.",
                    example: "6f0c2e1a-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
                  }),
                  status: z.enum(TASK_STATUSES).meta({
                    description: "The processing status of the upload.",
                    example: "PENDING",
                  }),
                  pageCount: z
                    .int()
                    .nonnegative()
                    .meta({ description: "The number of pages in the upload.", example: 20 }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or it has no upload with the given task ID.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  withAuth(),
  rateLimit({ prefix: "chapter-upload-status", windowMs: 60_000, limit: 120 }),
  validateQuery(getChapterUploadStatusQuerySchema),
  checkChapter({ unpublished: true }),
  authorizeChapter("update"),
  async (c) => {
    const { db, chapter } = c.var
    const { taskId } = c.var.query
    const task = await db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", taskId)
      .where("type", "=", "UPLOAD_CHAPTER")
      .executeTakeFirst()
    const manifest = chapterUploadManifestSchema.safeParse(task?.payload)

    if (!task || !manifest.success || manifest.data.chapterId !== chapter.id) {
      return c.fail("CHAPTER_UPLOAD_SESSION_NOT_FOUND")
    }

    return c.ok({
      taskId,
      status: task.status,
      pageCount: manifest.data.pages.length,
    })
  },
)
