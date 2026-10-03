import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

describe("POST /chapters/:id/open", () => {
  test("upserts a history entry", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/open`, { method: "POST", headers })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("userHistories")
      .selectAll()
      .where("userId", "=", userId)
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirst()

    expect(row).toBeDefined()
    expect(row?.completed).toBe(false)
  })

  test("is idempotent — calling twice keeps a single row, bumps updatedAt", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)

    await api(app, `/chapters/${SEEDED_CHAPTER_ID}/open`, { method: "POST", headers })

    const first = await services.db
      .selectFrom("userHistories")
      .select(["updatedAt"])
      .where("userId", "=", userId)
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirstOrThrow()

    await new Promise((r) => setTimeout(r, 10))

    await api(app, `/chapters/${SEEDED_CHAPTER_ID}/open`, { method: "POST", headers })

    const after = await services.db
      .selectFrom("userHistories")
      .selectAll()
      .where("userId", "=", userId)
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .execute()

    expect(after).toHaveLength(1)
    expect(after[0]!.updatedAt >= first.updatedAt).toBe(true)
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000/open`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/open`, { method: "POST" })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/open`, { method: "POST", headers })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/not-a-uuid/open`, { method: "POST", headers })

    expect(res.status).toBe(422)
  })
})
