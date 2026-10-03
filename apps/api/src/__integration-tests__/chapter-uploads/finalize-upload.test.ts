import { describe, expect } from "vitest"

import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("POST /chapters/:id/pages/finalize", () => {
  test("accepts a pending task and enqueues it", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_001, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()

    await services.db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId: chapter.id,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [
            {
              pageId: crypto.randomUUID(),
              stagingKey: `staging/chapters/${chapter.id}/${uploadId}/0`,
            },
          ],
        },
      })
      .execute()

    const res = await api<{ taskId: string }>(app, `/chapters/${chapter.id}/pages/finalize`, {
      method: "POST",
      headers,
      json: { taskId },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.taskId).toBe(taskId)
  })

  test("returns CHAPTER_UPLOAD_SESSION_NOT_FOUND for an unknown taskId", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_002, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/finalize`, {
      method: "POST",
      headers,
      json: { taskId: crypto.randomUUID() },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_UPLOAD_SESSION_NOT_FOUND")
  })

  test("returns CHAPTER_UPLOAD_SESSION_NOT_FOUND when task belongs to a different chapter", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapterA = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_003, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const chapterB = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_004, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()

    // Task is for chapterA, but we finalize against chapterB.
    await services.db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: {
          chapterId: chapterA.id,
          mediaId: SEEDED_MEDIA_ID,
          uploadId,
          pages: [],
        },
      })
      .execute()

    const res = await api(app, `/chapters/${chapterB.id}/pages/finalize`, {
      method: "POST",
      headers,
      json: { taskId },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_UPLOAD_SESSION_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_005, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/finalize`, {
      method: "POST",
      json: { taskId: crypto.randomUUID() },
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns VALIDATION_ERROR when taskId is not a UUID", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 98_006, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/finalize`, {
      method: "POST",
      headers,
      json: { taskId: "not-a-uuid" },
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
