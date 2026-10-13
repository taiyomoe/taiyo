import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { reapStaleChapterUploads } from "@taiyomoe/queue"
import { getChapterPageKey } from "@taiyomoe/s3"
import { sql } from "kysely"
import { describe, expect } from "vitest"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_UPLOADER_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"
const futureNow = () => new Date(Date.now() + 25 * 60 * 60 * 1000)

describe("reapStaleChapterUploads", () => {
  test("deletes stale PENDING tasks and their staged S3 objects", async ({ services }) => {
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
        number: 95_001,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: stagingKey,
        Body: Buffer.from("fake"),
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

    const result = await reapStaleChapterUploads({ db, s3, s3Bucket }, futureNow())

    expect(result.reaped).toBe(1)

    const remaining = await db
      .selectFrom("tasks")
      .select("id")
      .where("id", "=", taskId)
      .executeTakeFirst()

    expect(remaining).toBeUndefined()
  })

  test("deletes stale FAILED tasks", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 95_002,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "FAILED",
        sessionId: uploadId,
        payload: { chapterId, mediaId: SEEDED_MEDIA_ID, uploadId, pages: [] },
      })
      .execute()

    const result = await reapStaleChapterUploads({ db, s3, s3Bucket }, futureNow())

    expect(result.reaped).toBe(1)

    const remaining = await db
      .selectFrom("tasks")
      .select("id")
      .where("id", "=", taskId)
      .executeTakeFirst()

    expect(remaining).toBeUndefined()
  })

  test("reaps tasks stuck in DOWNLOADING", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 95_005,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
      })
      .execute()

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "DOWNLOADING",
        sessionId: uploadId,
        updatedAt: sql`CURRENT_TIMESTAMP - interval '25 hours'`,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [
            {
              pageId: crypto.randomUUID(),
              stagingKey: `staging/chapters/${chapterId}/${uploadId}/0`,
            },
          ],
        },
      })
      .execute()

    const result = await reapStaleChapterUploads({ db, s3, s3Bucket })

    expect(result.reaped).toBe(1)

    const remaining = await db
      .selectFrom("tasks")
      .select("id")
      .where("id", "=", taskId)
      .executeTakeFirst()

    expect(remaining).toBeUndefined()
  })

  test("keeps processed pages that the chapter references", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pageId = crypto.randomUUID()
    const pageKey = getChapterPageKey(SEEDED_MEDIA_ID, chapterId, pageId)

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 95_006,
        language: "en",
        uploaderId: SEEDED_UPLOADER_ID,
        pages: [{ id: pageId }],
      })
      .execute()

    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: pageKey,
        Body: Buffer.from("fake"),
        ContentType: "image/jpeg",
      }),
    )

    await db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "DOWNLOADING",
        sessionId: uploadId,
        updatedAt: sql`CURRENT_TIMESTAMP - interval '25 hours'`,
        payload: {
          chapterId,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [{ pageId, stagingKey: `staging/chapters/${chapterId}/${uploadId}/0` }],
        },
      })
      .execute()

    const result = await reapStaleChapterUploads({ db, s3, s3Bucket })

    expect(result.reaped).toBe(1)

    const listed = await s3.send(new ListObjectsV2Command({ Bucket: s3Bucket, Prefix: pageKey }))

    expect(listed.Contents).toHaveLength(1)
  })

  test("does not reap recent PENDING tasks when now is not advanced", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const chapterId = crypto.randomUUID()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()

    await db
      .insertInto("chapters")
      .values({
        id: chapterId,
        mediaId: SEEDED_MEDIA_ID,
        number: 95_003,
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
        payload: { chapterId, mediaId: SEEDED_MEDIA_ID, uploadId, pages: [] },
      })
      .execute()

    const result = await reapStaleChapterUploads({ db, s3, s3Bucket }, new Date())

    expect(result.reaped).toBe(0)

    const remaining = await db
      .selectFrom("tasks")
      .select("id")
      .where("id", "=", taskId)
      .executeTakeFirst()

    expect(remaining).toBeDefined()
  })

  test("returns reaped: 0 when there is nothing to reap", async ({ services }) => {
    const { db, s3, s3Bucket } = services
    const result = await reapStaleChapterUploads({ db, s3, s3Bucket }, new Date())

    expect(result.reaped).toBe(0)
  })
})
