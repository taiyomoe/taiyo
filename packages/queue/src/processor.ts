import { config } from "@taiyomoe/config"
import { type DB, IMAGE_MIME_TYPES } from "@taiyomoe/db"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  getChapterPageKey,
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@taiyomoe/s3"
import { sql, type Kysely } from "kysely"
import { filetypeinfo } from "magic-bytes.js"
import sharp from "sharp"
import {
  type ChapterUploadJobData,
  type ChapterUploadManifest,
  chapterUploadManifestSchema,
} from "./types"

export type ProcessorDeps = { db: Kysely<DB>; s3: S3Client; s3Bucket: string }

export const processChapterUpload = async (
  { db, s3, s3Bucket }: ProcessorDeps,
  { taskId }: ChapterUploadJobData,
  { isFinalAttempt = true }: { isFinalAttempt?: boolean } = {},
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

  let manifest: ChapterUploadManifest | undefined
  let pagesCommitted = false

  try {
    await db
      .updateTable("tasks")
      .set({ status: "DOWNLOADING", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    manifest = chapterUploadManifestSchema.parse(task.payload)

    for (const { pageId, stagingKey } of manifest.pages) {
      const { ContentLength } = await s3.send(
        new HeadObjectCommand({ Bucket: s3Bucket, Key: stagingKey }),
      )

      if (ContentLength === undefined || ContentLength > config.images.maxChapterPageSizeBytes) {
        throw new Error(`page ${pageId} exceeds max size`)
      }

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

    const written = await db
      .updateTable("chapters")
      .set({ pages: manifest.pages.map(({ pageId }) => ({ id: pageId })) })
      .where("id", "=", manifest.chapterId)
      .where(sql<boolean>`("pages" IS NULL OR cardinality("pages") = 0)`)
      .executeTakeFirst()

    if (written.numUpdatedRows === 0n) {
      throw new Error(`chapter ${manifest.chapterId} already has pages`)
    }

    pagesCommitted = true

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
    if (!isFinalAttempt) {
      throw err
    }

    await db
      .updateTable("tasks")
      .set({ status: "FAILED", updatedAt: sql`CURRENT_TIMESTAMP` })
      .where("id", "=", taskId)
      .execute()

    if (manifest !== undefined && !pagesCommitted) {
      const { mediaId, chapterId, pages } = manifest
      const pageKeys = pages.map(({ pageId }) => ({
        Key: getChapterPageKey(mediaId, chapterId, pageId),
      }))

      for (let i = 0; i < pageKeys.length; i += 1000) {
        await s3
          .send(
            new DeleteObjectsCommand({
              Bucket: s3Bucket,
              Delete: { Objects: pageKeys.slice(i, i + 1000) },
            }),
          )
          .catch(() => {})
      }
    }

    throw err
  }
}
