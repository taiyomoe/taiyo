import { config } from "@taiyomoe/config"
import { type DB, IMAGE_MIME_TYPES } from "@taiyomoe/db"
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
import type { ChapterUploadJobData, ChapterUploadManifest } from "./types"

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

  const manifest = task.payload as ChapterUploadManifest

  try {
    await db
      .updateTable("tasks")
      .set({ status: "DOWNLOADING", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    for (const { pageId, stagingKey } of manifest.pages) {
      const obj = await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: stagingKey }))
      const buffer = Buffer.from(await obj.Body!.transformToByteArray())

      if (buffer.byteLength > config.images.maxChapterPageSizeBytes) {
        throw new Error(`page ${pageId} exceeds max size`)
      }

      const detected = filetypeinfo(Array.from(buffer.subarray(0, 100))).find(
        (ft) => !!ft.mime && ft.mime in IMAGE_MIME_TYPES,
      )

      if (!detected?.mime) {
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

    await db
      .updateTable("chapters")
      .set({ pages: manifest.pages.map(({ pageId }) => ({ id: pageId })) })
      .where("id", "=", manifest.chapterId)
      .execute()

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
