import { chapterUploadAudit } from "@taiyomoe/audit"
import { chapterUploadManifestSchema } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const finalizeChapterUploadSchema = z.object({
  taskId: z.uuid().meta({
    description: "Task ID returned when the upload session was opened.",
    example: crypto.randomUUID(),
  }),
})

export const finalizeChapterUploadHandler = new Hono().post(
  "/:id/pages/finalize",
  describeRoute({
    summary: "Finalize a chapter page upload",
    description:
      "Submits an opened upload session for processing once every page has been uploaded. Pages are processed in the background; poll the status route for completion.\n\n**Authentication:** uploader, moderator, admin — or a member with `EDIT_CHAPTERS` in a group credited on the chapter.",
    tags: ["Chapters"],
    requestBody: {
      content: {
        "application/json": await resolver(finalizeChapterUploadSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Upload accepted; pages are processed in the background.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({ description: "ID of the upload task." }),
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
  audited(chapterUploadAudit.FINALIZE),
  withAuth(),
  validateJson(finalizeChapterUploadSchema),
  checkChapter({ unpublished: true }),
  authorizeChapter("update"),
  withTransaction,
  async (c) => {
    const { db, chapter, chapterUploadQueue } = c.var
    const { taskId } = c.var.json

    c.var.audit.set({ target: { mediaId: chapter.mediaId, taskId } })

    const task = await db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", taskId)
      .where("type", "=", "UPLOAD_CHAPTER")
      .executeTakeFirst()
    const manifest = chapterUploadManifestSchema.safeParse(task?.payload)

    if (
      !task ||
      !manifest.success ||
      manifest.data.chapterId !== chapter.id ||
      task.status !== "PENDING"
    ) {
      return c.fail("CHAPTER_UPLOAD_SESSION_NOT_FOUND")
    }

    c.var.afterCommit(async () => {
      await chapterUploadQueue.enqueue({ taskId })
    })

    return c.ok({ taskId })
  },
)
