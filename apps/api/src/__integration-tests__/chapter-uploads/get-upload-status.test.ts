import { describe, expect } from "vitest"

import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("GET /chapters/:id/pages/status", () => {
  test("returns the task status and page count", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 97_001, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const uploadId = crypto.randomUUID()
    const taskId = crypto.randomUUID()
    const pages = [
      { pageId: crypto.randomUUID(), stagingKey: `staging/chapters/${chapter.id}/${uploadId}/0` },
      { pageId: crypto.randomUUID(), stagingKey: `staging/chapters/${chapter.id}/${uploadId}/1` },
    ]

    await services.db
      .insertInto("tasks")
      .values({
        id: taskId,
        type: "UPLOAD_CHAPTER",
        status: "PENDING",
        sessionId: uploadId,
        payload: { chapterId: chapter.id, mediaId: SEEDED_MEDIA_ID, uploadId, pages },
      })
      .execute()

    const res = await api<{ taskId: string; status: string; pageCount: number }>(
      app,
      `/chapters/${chapter.id}/pages/status?taskId=${taskId}`,
      { headers },
    )

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.taskId).toBe(taskId)
    expect(res.body.data.status).toBe("PENDING")
    expect(res.body.data.pageCount).toBe(2)
  })

  test("returns CHAPTER_UPLOAD_SESSION_NOT_FOUND for an unknown taskId", async ({
    app,
    services,
  }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 97_002, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(
      app,
      `/chapters/${chapter.id}/pages/status?taskId=${crypto.randomUUID()}`,
      { headers },
    )

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
      .values({ mediaId: SEEDED_MEDIA_ID, number: 97_003, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/status?taskId=${crypto.randomUUID()}`)

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns VALIDATION_ERROR when taskId query param is missing", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 97_004, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/status`, { headers })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
