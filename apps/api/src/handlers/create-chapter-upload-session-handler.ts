import { chapterUploadAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { IMAGE_MIME_TYPES } from "@taiyomoe/db"
import { getPresignedUploadUrl } from "@taiyomoe/s3"
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
import { isImageMimeType } from "../utils/is-image-mime-type"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const imageMimeKeys = Object.keys(IMAGE_MIME_TYPES).filter(isImageMimeType)
const createChapterUploadSessionSchema = z.object({
  pages: z
    .array(
      z.object({
        contentType: z
          .enum(imageMimeKeys)
          .meta({ description: "The MIME type of the page image.", example: "image/jpeg" }),
        size: z
          .int()
          .positive()
          .max(config.images.maxChapterPageSizeBytes)
          .meta({
            description: `The size of the page image in bytes, up to ${config.images.maxChapterPageSizeBytes}.`,
            example: 512000,
          }),
      }),
    )
    .min(1)
    .max(config.images.maxChapterPages)
    .meta({
      description: `The pages of the chapter, in reading order, up to ${config.images.maxChapterPages}.`,
    }),
})

export const createChapterUploadSessionHandler = new Hono().post(
  "/:id/pages/upload-session",
  describeRoute({
    summary: "Open a chapter page upload session",
    description: `Opens an upload session for the pages of a chapter that has none yet, and returns one upload URL per page. Upload each image to its URL with a \`PUT\`, then finalize the upload. The URLs expire after ${config.images.uploadUrlTtlSeconds / 60} minutes.\n\n**Required access:** uploader or admin, a moderator or a member of a credited group with the \`EDIT_CHAPTERS\` permission when the chapter is published or scheduled, or the user who uploaded the chapter while it is uploading, pending or scheduled.`,
    tags: ["Chapters"],
    responses: {
      201: {
        description: "Upload session opened.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({
                    description: "The ID of the upload task, to finalize the upload with.",
                    example: "6f0c2e1a-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
                  }),
                  pages: z
                    .array(
                      z.object({
                        index: z.int().nonnegative().meta({
                          description: "The zero-based position of the page.",
                          example: 0,
                        }),
                        uploadUrl: z
                          .url()
                          .meta({ description: "The one-time URL to upload the page image to." }),
                      }),
                    )
                    .meta({ description: "The upload URL of each page, in reading order." }),
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
        451: "The chapter's media is locked, so no page can be uploaded.",
        409: "The chapter already has pages, or it is only hosted on the group's site.",
        422: "The provided ID is not a valid UUID, or the request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  audited(chapterUploadAudit.START),
  withAuth(),
  rateLimit({ prefix: "chapter-upload-session", windowMs: 60_000, limit: 60 }),
  validateJson(createChapterUploadSessionSchema),
  checkChapter({ unpublished: true, refuseLocked: true }),
  authorizeChapter("update"),
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, chapter } = c.var
    const body = c.var.json

    if (chapter.isExternal) {
      return c.fail("CHAPTER_EXTERNAL")
    }

    if (chapter.pages !== null && chapter.pages.length > 0) {
      return c.fail("CHAPTER_PAGES_ALREADY_UPLOADED")
    }

    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const manifestPages: Array<{ pageId: string; stagingKey: string }> = []
    const responsePages: Array<{ index: number; uploadUrl: string }> = []

    for (const [i, page] of body.pages.entries()) {
      const pageId = crypto.randomUUID()
      const stagingKey = `staging/chapters/${chapter.id}/${uploadId}/${i}`
      const uploadUrl = await getPresignedUploadUrl(
        s3,
        s3Bucket,
        stagingKey,
        page.contentType,
        page.size,
        config.images.uploadUrlTtlSeconds,
      )

      manifestPages.push({ pageId, stagingKey })
      responsePages.push({ index: i, uploadUrl })
    }

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId: chapter.id,
          mediaId: chapter.mediaId,
          uploadId,
          pages: manifestPages,
        },
      })
      .execute()

    c.var.audit.set({
      target: { mediaId: chapter.mediaId, taskId, pageCount: body.pages.length },
    })

    return c.ok({ taskId, pages: responsePages })
  },
)
