import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { sql } from "@taiyomoe/db"
import { processChapterUpload } from "@taiyomoe/queue"
import sharp from "sharp"
import { describe, expect } from "vitest"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_UPLOADER_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"
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

  test("publishes an uploading chapter as just released, schedules it, or keeps a submission pending", async ({
    services,
  }) => {
    const { db, s3, s3Bucket } = services
    const stage = async (status: "UPLOADING" | "PENDING", number: number, scheduled = false) => {
      const chapterId = crypto.randomUUID()
      const uploadId = crypto.randomUUID()
      const taskId = crypto.randomUUID()
      const stagingKey = `staging/chapters/${chapterId}/${uploadId}/0`

      await db
        .insertInto("chapters")
        .values({
          id: chapterId,
          mediaId: SEEDED_MEDIA_ID,
          number,
          language: "en",
          uploaderId: SEEDED_UPLOADER_ID,
          status,
          createdAt: sql<Date>`now() at time zone 'UTC' - interval '1 day'`,
          publishAt: scheduled ? sql<Date>`now() at time zone 'UTC' + interval '1 day'` : null,
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
            pages: [{ pageId: crypto.randomUUID(), stagingKey }],
          },
        })
        .execute()
      await processChapterUpload({ db, s3, s3Bucket }, { taskId })

      return db
        .selectFrom("chapters")
        .select([
          "status",
          sql<boolean>`"createdAt" > now() at time zone 'UTC' - interval '1 hour'`.as("fresh"),
        ])
        .where("id", "=", chapterId)
        .executeTakeFirstOrThrow()
    }

    expect(await stage("UPLOADING", 96_101)).toEqual({ status: "PUBLISHED", fresh: true })
    expect(await stage("PENDING", 96_102)).toEqual({ status: "PENDING", fresh: false })
    expect(await stage("UPLOADING", 96_103, true)).toEqual({ status: "SCHEDULED", fresh: false })
    expect(await stage("PENDING", 96_104, true)).toEqual({ status: "PENDING", fresh: false })
  })

  test("leaves rejected and withdrawn chapters without pages and removes the processed files", async ({
    services,
  }) => {
    const { db, s3, s3Bucket } = services

    for (const state of ["REJECTED", "WITHDRAWN"] as const) {
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
          number: 96_002,
          language: "en",
          uploaderId: SEEDED_UPLOADER_ID,
          status: state === "REJECTED" ? "REJECTED" : "PENDING",
          deletedAt: state === "WITHDRAWN" ? new Date() : null,
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
            pages: [{ pageId, stagingKey }],
          },
        })
        .execute()

      await processChapterUpload({ db, s3, s3Bucket }, { taskId })

      const chapter = await db
        .selectFrom("chapters")
        .select(["pages"])
        .where("id", "=", chapterId)
        .executeTakeFirstOrThrow()
      const listed = await s3.send(
        new ListObjectsV2Command({
          Bucket: s3Bucket,
          Prefix: `medias/${SEEDED_MEDIA_ID}/chapters/${chapterId}/`,
        }),
      )

      expect({ state, pages: chapter.pages, files: listed.Contents ?? [] }).toEqual({
        state,
        pages: null,
        files: [],
      })
    }
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

  test("returns silently when task does not exist", async ({ services }) => {
    const { db, s3, s3Bucket } = services

    await expect(
      processChapterUpload({ db, s3, s3Bucket }, { taskId: crypto.randomUUID() }),
    ).resolves.toBeUndefined()
  })
})
