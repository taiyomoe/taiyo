import { config } from "@taiyomoe/config"
import { IMAGE_MIME_TYPES } from "@taiyomoe/db"
import { getPresignedUploadUrl } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
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
          .meta({ description: "MIME type of the page image.", example: "image/jpeg" }),
        size: z.int().positive().max(config.images.maxChapterPageSizeBytes).meta({
          description: "Size of the page image in bytes.",
          example: 512000,
        }),
      }),
    )
    .min(1)
    .max(config.images.maxChapterPages)
    .meta({ description: "Ordered list of pages to include in this chapter." }),
})

export const createChapterUploadSessionHandler = new Hono().post(
  "/:id/pages/upload-session",
  describeRoute({
    summary: "Open a chapter page upload session",
    description:
      "Opens an upload session for a chapter's pages. Returns one-time upload URLs for each page; upload each page to its URL, then call finalize. Sessions expire after 10 minutes.\n\n**Authentication:** uploader, moderator, admin — or a member with `EDIT_CHAPTERS` in a group credited on the chapter.",
    tags: ["Chapters"],
    requestBody: {
      content: {
        "application/json": await resolver(createChapterUploadSessionSchema).toOpenAPISchema(),
      },
    },
    responses: {
      201: {
        description: "Upload session opened.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  taskId: z.uuid().meta({ description: "ID of the upload task." }),
                  pages: z
                    .array(
                      z.object({
                        index: z
                          .int()
                          .nonnegative()
                          .meta({ description: "Zero-based page index." }),
                        uploadUrl: z
                          .url()
                          .meta({ description: "One-time upload URL for this page." }),
                      }),
                    )
                    .meta({ description: "Per-page upload URLs, in order." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No chapter with the given id exists.",
        409: "This chapter already has pages, or is only hosted on the group's site.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth(),
  rateLimit({ prefix: "chapter-upload-session", windowMs: 60_000, limit: 60 }),
  validateJson(createChapterUploadSessionSchema),
  checkChapter({ unpublished: true }),
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

    return c.ok({ taskId, pages: responsePages })
  },
)
