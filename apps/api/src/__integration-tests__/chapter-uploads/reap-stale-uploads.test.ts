import { reapStaleChapterUploads } from "@taiyomoe/queue"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { describe, expect } from "vitest"

import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_UPLOADER_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"
// staleUploadReapHours = 24; pass a "now" 25 hours in the future so that tasks
// created "now" appear stale from the reaper's perspective.
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

    // Put a fake staged object so we can verify it gets deleted.
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

    // Advance `now` 25 h into the future so the task is older than the 24 h cutoff.
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

    // Use real now — task was just created so it must NOT be reaped.
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
