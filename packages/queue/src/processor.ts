import { config } from "@taiyomoe/config"
import { type ChapterStatus, type DB, IMAGE_MIME_TYPES } from "@taiyomoe/db"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  getChapterPageKey,
  PutObjectCommand,
  type S3Client,
} from "@taiyomoe/s3"
import { sql, type Kysely } from "kysely"
import { filetypeinfo } from "magic-bytes.js"
import sharp from "sharp"
import { type ChapterUploadJobData, chapterUploadManifestSchema } from "./types"

export type ProcessorDeps = { db: Kysely<DB>; s3: S3Client; s3Bucket: string }

export const processChapterUpload = async (
  { db, s3, s3Bucket }: ProcessorDeps,
  { taskId }: ChapterUploadJobData,
) => {
  const task = await db
    .selectFrom("tasks")
    .selectAll()
    .where("id", "=", taskId)
    .where("type", "=", "UPLOAD_CHAPTER")
    .executeTakeFirst()

  if (!task) {
    return
  }

  try {
    await db
      .updateTable("tasks")
      .set({ status: "DOWNLOADING", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    const manifest = chapterUploadManifestSchema.parse(task.payload)

    for (const { pageId, stagingKey } of manifest.pages) {
      const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: stagingKey }))

      if (obj.Body === undefined) {
        throw new Error(`page ${pageId} has no body`)
      }

      const buffer = Buffer.from(await obj.Body.transformToByteArray())

      if (buffer.byteLength > config.images.maxChapterPageSizeBytes) {
        throw new Error(`page ${pageId} exceeds max size`)
      }

      const isImage = filetypeinfo(Array.from(buffer.subarray(0, 100))).some(
        (ft) => ft.mime !== undefined && ft.mime in IMAGE_MIME_TYPES,
      )

      if (!isImage) {
        throw new Error(`page ${pageId} is not a valid image`)
      }

      const processed = await sharp(buffer)
        .rotate()
        .jpeg({ quality: config.images.chapterPageQuality })
        .toBuffer()

      await s3.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: getChapterPageKey(manifest.mediaId, manifest.chapterId, pageId),
          Body: processed,
          ContentType: "image/jpeg",
        }),
      )
    }

    const attached = await db
      .updateTable("chapters")
      .set({
        pages: manifest.pages.map(({ pageId }) => ({ id: pageId })),
        status: sql<ChapterStatus>`case
          when "status" <> 'UPLOADING' then "status"
          when "publishAt" > (CURRENT_TIMESTAMP at time zone 'UTC') then 'SCHEDULED'::"ChapterStatus"
          else 'PUBLISHED'::"ChapterStatus"
        end`,
        createdAt: sql<Date>`case
          when "status" = 'UPLOADING' and "publishAt" > (CURRENT_TIMESTAMP at time zone 'UTC') then "createdAt"
          when "status" = 'UPLOADING' then CURRENT_TIMESTAMP
          else "createdAt"
        end`,
      })
      .where("id", "=", manifest.chapterId)
      .where("deletedAt", "is", null)
      .where("status", "!=", "REJECTED")
      .returning("id")
      .executeTakeFirst()

    if (attached === undefined) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: s3Bucket,
          Delete: {
            Objects: manifest.pages.map(({ pageId }) => ({
              Key: getChapterPageKey(manifest.mediaId, manifest.chapterId, pageId),
            })),
          },
        }),
      )
    }

    await db
      .updateTable("tasks")
      .set({ status: "FINISHED", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    await s3
      .send(
        new DeleteObjectsCommand({
          Bucket: s3Bucket,
          Delete: { Objects: manifest.pages.map(({ stagingKey }) => ({ Key: stagingKey })) },
        }),
      )
      .catch(() => {})
  } catch (err) {
    await db
      .updateTable("tasks")
      .set({ status: "FAILED", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    throw err
  }
}
