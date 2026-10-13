import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { config } from "@taiyomoe/config"
import { processChapterUpload } from "@taiyomoe/queue"
import { getChapterPageKey } from "@taiyomoe/s3"
import sharp from "sharp"
import { describe, expect } from "vitest"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_UPLOADER_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"
const SEEDED_CHAPTER_WITH_PAGES_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"
const makeTinyJpeg = async () =>
  sharp({
    create: { width: 4, height: 4, channels: 3, background: { r: 100, g: 150, b: 200 } },
  })
    .jpeg()
    .toBuffer()

describe("processChapterUpload", () => {
  test("downloads staged pages, compresses them, writes final objects, and marks task FINISHED", async ({
    services,
  }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pageId = crypto.randomUUID()
    const stagingKey = `staging/chapters/${chapterId}/${uploadId}/0`

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 96_001,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    const jpegBuf = await makeTinyJpeg()

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: stagingKey,
        Body: jpegBuf,
        ContentType: "image/jpeg",
      }),
    )

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [{ pageId, stagingKey }],
        },
      })
      .execute()

    await processChapterUpload({ db, s3, s3Bucket }, { taskId })

    const task = await db
      .selectFrom("tasks")
      .select(["status"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow()

    expect(task.status).toBe("FINISHED")

    const chapter = await db
      .selectFrom("chapters")
      .select(["pages"])
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    expect(chapter.pages).toHaveLength(1)
    expect(chapter.pages?.[0]?.id).toBe(pageId)

    const finalKey = `medias/${SEEDED_MEDIA_ID}/chapters/${chapterId}/${pageId}.jpg`
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: finalKey }))

    expect(listed.Contents).toHaveLength(1)
  })

  test("marks task FAILED and rethrows when a staged page is missing from S3", async ({
    services,
  }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pageId = crypto.randomUUID()

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 96_002,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [{ pageId, stagingKey: `staging/chapters/${chapterId}/${uploadId}/missing` }],
        },
      })
      .execute()

    await expect(processChapterUpload({ db, s3, s3Bucket }, { taskId })).rejects.toThrow(Error)

    const task = await db
      .selectFrom("tasks")
      .select(["status"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow()

    expect(task.status).toBe("FAILED")
  })

  test("leaves status untouched and rethrows on a non-final attempt", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pageId = crypto.randomUUID()

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 96_003,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [{ pageId, stagingKey: `staging/chapters/${chapterId}/${uploadId}/missing` }],
        },
      })
      .execute()

    await expect(
      processChapterUpload({ db, s3, s3Bucket }, { taskId }, { isFinalAttempt: false }),
    ).rejects.toThrow(Error)

    const task = await db
      .selectFrom("tasks")
      .select(["status"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow()

    expect(task.status).toBe("DOWNLOADING")
  })

  test("deletes already-processed pages when the final attempt fails", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const stagingKey = `staging/chapters/${chapterId}/${uploadId}/0`

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 96_004,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: stagingKey,
        Body: await makeTinyJpeg(),
        ContentType: "image/jpeg",
      }),
    )

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [
            { pageId: crypto.randomUUID(), stagingKey },
            {
              pageId: crypto.randomUUID(),
              stagingKey: `staging/chapters/${chapterId}/${uploadId}/missing`,
            },
          ],
        },
      })
      .execute()

    await expect(processChapterUpload({ db, s3, s3Bucket }, { taskId })).rejects.toThrow(Error)

    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: s3Bucket,
        Prefix: `medias/${SEEDED_MEDIA_ID}/chapters/${chapterId}/`,
      }),
    )

    expect(listed.Contents ?? []).toHaveLength(0)

    const chapter = await db
      .selectFrom("chapters")
      .select(["pages"])
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    expect(chapter.pages).toBeNull()
  })

  test(
    "fails without downloading when a staged page is over the size limit",
    { timeout: 30_000 },
    async ({ services }) => {
      const { db, s3, s3Bucket } = services
      const chapterId = crypto.randomUUID()
      const uploadId = crypto.randomUUID()
      const taskId = crypto.randomUUID()
      const pageId = crypto.randomUUID()
      const stagingKey = `staging/chapters/${chapterId}/${uploadId}/0`

      await db
        .insertInto("chapters")
        .values({
          id: chapterId,
          mediaId: SEEDED_MEDIA_ID,
          number: 96_005,
          language: "en",
          uploaderId: SEEDED_UPLOADER_ID,
        })
        .execute()

      await s3.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: stagingKey,
          Body: Buffer.alloc(config.images.maxChapterPageSizeBytes + 1),
          ContentType: "image/jpeg",
        }),
      )

      await db
        .insertInto("tasks")
        .values({
          id: taskId,
          type: "UPLOAD_CHAPTER",
          status: "PENDING",
          sessionId: uploadId,
          payload: {
            chapterId,
            mediaId: SEEDED_MEDIA_ID,
            uploadId,
            pages: [{ pageId, stagingKey }],
          },
        })
        .execute()

      await expect(processChapterUpload({ db, s3, s3Bucket }, { taskId })).rejects.toThrow(
        "exceeds max size",
      )

      const task = await db
        .selectFrom("tasks")
        .select(["status"])
        .where("id", "=", taskId)
        .executeTakeFirstOrThrow()

      expect(task.status).toBe("FAILED")
    },
  )

  test("does not overwrite pages written by another upload", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = SEEDED_CHAPTER_WITH_PAGES_ID
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pageId = crypto.randomUUID()
    const stagingKey = `staging/chapters/${chapterId}/${uploadId}/0`
    const before = await db
      .selectFrom("chapters")
      .select(["mediaId", "pages"])
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: stagingKey,
        Body: await makeTinyJpeg(),
        ContentType: "image/jpeg",
      }),
    )

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId,
          mediaId: before.mediaId,
          uploadId,
          pages: [{ pageId, stagingKey }],
        },
      })
      .execute()

    await expect(processChapterUpload({ db, s3, s3Bucket }, { taskId })).rejects.toThrow(
      "already has pages",
    )

    const after = await db
      .selectFrom("chapters")
      .select(["pages"])
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    expect(after.pages).toEqual(before.pages)

    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: s3Bucket,
        Prefix: getChapterPageKey(before.mediaId, chapterId, pageId),
      }),
    )

    expect(listed.Contents ?? []).toHaveLength(0)
  })

  test("returns silently when task does not exist", async ({ services }) => {
    const { db, s3, s3Bucket } = services

    await expect(
      processChapterUpload({ db, s3, s3Bucket }, { taskId: crypto.randomUUID() }),
    ).resolves.toBeUndefined()
  })
})
