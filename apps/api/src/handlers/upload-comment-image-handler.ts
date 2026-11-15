import { commentImageAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { DeleteObjectsCommand, PutObjectCommand } from "@taiyomoe/s3"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { bodyLimit } from "hono/body-limit"
import z from "zod"
import {
  COMMENT_IMAGE_MIME_TYPES,
  CommentImageError,
  getCommentImageKey,
  isCommentImageBlocked,
  processCommentImage,
  toCommentImage,
} from "../comment-images"
import { audited } from "../middlewares/audited-middleware"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { transcodeSlot } from "../middlewares/transcode-slot-middleware"
import { validateFormData } from "../middlewares/validate-form-data-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const MAX_MB = config.comments.maxImageSizeBytes / 1024 / 1024
const bodySchema = z.object({
  file: z
    .file()
    .max(config.comments.maxImageSizeBytes)
    .mime([...COMMENT_IMAGE_MIME_TYPES])
    .meta({
      description: `The image to upload: a JPEG, PNG, GIF, WebP or AVIF file up to ${MAX_MB} MB.`,
    }),
})

export const commentImageSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the image." }),
  url: z.url().meta({ description: "The URL of the image." }),
  width: z.int().meta({ description: "The width of the image, in pixels.", example: 640 }),
  height: z.int().meta({ description: "The height of the image, in pixels.", example: 480 }),
  animated: z.boolean().meta({ description: "Whether the image is animated." }),
  uploaderId: z.uuid().meta({ description: "The ID of the user who uploaded the image." }),
})

export const uploadCommentImageHandler = new Hono().post(
  "/",
  describeRoute({
    summary: "Upload a comment image",
    description: `Uploads an image or GIF to use in comments. It is stripped of metadata and re-encoded as WebP, animations included, and uploading the same file twice returns the first upload. An image no comment uses and nobody favorited is deleted after ${config.comments.orphanImageHours} hours.\n\n**Authentication:** signed-in user.`,
    tags: ["Comment images"],
    responses: {
      201: {
        description: "Image uploaded.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(commentImageSchema)) },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        409: "The same image was removed while you uploaded it, try again.",
        422: `The request body failed validation, or the file is not a valid image, weighs more than ${MAX_MB} MB, is wider or taller than ${config.comments.maxImageDimension} pixels, has more than ${config.comments.maxImageFrames} frames or too many pixels in total, or was blocked by a moderator.`,
        429: "Too many uploads, try again later.",
      }),
    },
  }),
  audited(commentImageAudit.UPLOAD, () => ({})),
  withAuth("comment.create"),
  rateLimit({ prefix: "upload-comment-image", windowMs: 60 * 60_000, limit: 30 }),
  bodyLimit({
    maxSize: config.comments.maxImageSizeBytes + 64 * 1024,
    onError: (c) => c.fail("IMAGE_TOO_LARGE"),
  }),
  validateFormData(bodySchema),
  transcodeSlot,
  withTransaction,
  async (c) => {
    const { db, s3, s3Bucket, user } = c.var
    const input = Buffer.from(await c.var.formData.file.arrayBuffer())
    let processed: Awaited<ReturnType<typeof processCommentImage>>

    try {
      processed = await processCommentImage(input)
    } catch (error) {
      if (error instanceof CommentImageError) {
        return c.fail(error.code)
      }

      throw error
    }

    if (await isCommentImageBlocked(db, processed)) {
      return c.fail("COMMENT_IMAGE_BLOCKED")
    }

    const findExisting = () =>
      db
        .selectFrom("commentImages")
        .select(["id", "key", "width", "height", "animated", "uploaderId"])
        .where("uploaderId", "=", user.id)
        .where("sha256", "=", processed.sha256)
        .where("removedAt", "is", null)
        .executeTakeFirst()
    const existing = await findExisting()

    if (existing !== undefined) {
      c.var.audit.set({ target: { id: existing.id, deduplicated: true } })

      return c.ok(toCommentImage(existing))
    }

    const id = crypto.randomUUID()
    const key = getCommentImageKey(id)

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: processed.body,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    )
    const deleteUpload = async () => {
      await s3.send(
        new DeleteObjectsCommand({ Bucket: s3Bucket, Delete: { Objects: [{ Key: key }] } }),
      )
    }

    c.var.onRollback(deleteUpload)

    const image = await db
      .insertInto("commentImages")
      .values({
        id,
        uploaderId: user.id,
        key,
        width: processed.width,
        height: processed.height,
        animated: processed.animated,
        byteSize: processed.byteSize,
        sha256: processed.sha256,
        dhash: processed.dhash,
      })
      .onConflict((oc) =>
        oc.columns(["uploaderId", "sha256"]).where("removedAt", "is", null).doNothing(),
      )
      .returning(["id", "key", "width", "height", "animated", "uploaderId"])
      .executeTakeFirst()

    if (image === undefined) {
      c.var.afterCommit(deleteUpload)

      const winner = await findExisting()

      if (winner === undefined) {
        return c.fail("CONFLICT")
      }

      return c.ok(toCommentImage(winner))
    }

    c.var.audit.set({ target: { id, animated: processed.animated, byteSize: processed.byteSize } })

    return c.ok(toCommentImage(image))
  },
)
