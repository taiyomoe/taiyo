import { chapterUploadAudit } from "@taiyomoe/audit"
import { chapterUploadManifestSchema } from "@taiyomoe/queue"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { authorizeChapter } from "../middlewares/authorize-chapter-middleware"
import { checkChapter } from "../middlewares/check-chapter-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const finalizeChapterUploadSchema = z.object({
  taskId: z.uuid().meta({
    description: "The ID of the upload task returned when the upload session was opened.",
    example: "6f0c2e1a-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
  }),
})

export const finalizeChapterUploadHandler = new Hono().post(
  "/:id/pages/finalize",
  describeRoute({
    summary: "Finalize a chapter page upload",
    description:
      "Finalizes an upload session once every page image is uploaded. The pages are then processed in the background; poll the upload status to know when they are ready.\n\n**Required access:** uploader or admin, a moderator, the uploader intern who uploaded it or a member of a credited group with the `EDIT_CHAPTERS` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading, pending or scheduled.",
    tags: ["Chapters"],
    responses: {
      201: {
        description: "Upload finalized.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({
                    description: "The ID of the upload task.",
                    example: "6f0c2e1a-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No chapter with the given ID exists, or it has no pending upload session with the given task ID.",
        451: "The chapter's media is locked, so no page can be uploaded.",
        409: "The chapter already has pages.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(chapterUploadAudit.FINALIZE),
  withAuth(),
  rateLimit({ prefix: "chapter-upload-finalize", windowMs: 60_000, limit: 60 }),
  validateJson(finalizeChapterUploadSchema),
  checkChapter({ unpublished: true, refuseLocked: true }),
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

    if (chapter.pages !== null && chapter.pages.length > 0) {
      return c.fail("CHAPTER_PAGES_ALREADY_UPLOADED")
    }

    await chapterUploadQueue.enqueue({ taskId })

    return c.ok({ taskId })
  },
)
