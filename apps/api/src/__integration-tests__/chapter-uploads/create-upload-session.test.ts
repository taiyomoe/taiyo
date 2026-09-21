import { describe, expect } from "vitest"

import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
// Seeded chapter that already has pages — must be rejected.
const SEEDED_CHAPTER_WITH_PAGES_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"
const makePages = (n = 2) =>
  Array.from({ length: n }, () => ({ contentType: "image/jpeg" as const, size: 512_000 }))

describe("POST /chapters/:id/pages/upload-session", () => {
  test("opens an upload session and returns presigned URLs", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 99_001, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<{ taskId: string; pages: { index: number; uploadUrl: string }[] }>(
      app,
      `/chapters/${chapter.id}/pages/upload-session`,
      { method: "POST", headers, json: { pages: makePages(3) } },
    )

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.taskId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    expect(res.body.data.pages).toHaveLength(3)
    expect(res.body.data.pages[0]?.index).toBe(0)
    expect(res.body.data.pages[0]?.uploadUrl).toMatch(/^http/)

    const task = await services.db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", res.body.data.taskId)
      .executeTakeFirst()

    expect(task).toBeDefined()
    expect(task?.type).toBe("UPLOAD_CHAPTER")
    expect(task?.status).toBe("PENDING")
  })

  test("returns CHAPTER_PAGES_ALREADY_UPLOADED when chapter already has pages", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_WITH_PAGES_ID}/pages/upload-session`, {
      method: "POST",
      headers,
      json: { pages: makePages(1) },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_PAGES_ALREADY_UPLOADED")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 99_002, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/upload-session`, {
      method: "POST",
      json: { pages: makePages(1) },
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 99_003, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/chapters/${chapter.id}/pages/upload-session`, {
      method: "POST",
      headers,
      json: { pages: makePages(1) },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when pages array is empty", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { role: "ADMIN" })
    const chapter = await services.db
      .insertInto("chapters")
      .values({ mediaId: SEEDED_MEDIA_ID, number: 99_004, language: "en", uploaderId: userId })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/chapters/${chapter.id}/pages/upload-session`, {
      method: "POST",
      headers,
      json: { pages: [] },
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(
      app,
      `/chapters/00000000-0000-0000-0000-000000000000/pages/upload-session`,
      { method: "POST", headers, json: { pages: makePages(1) } },
    )

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })
})
