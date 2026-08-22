import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

describe("PATCH /chapters/:id/history", () => {
  test("updates pageId and completed", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userHistories")
      .values({ userId, chapterId: SEEDED_CHAPTER_ID })
      .execute()

    const pageId = randomUUID()
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/history`, {
      method: "PATCH",
      headers,
      json: { pageId, completed: true },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userHistories")
      .selectAll()
      .where("userId", "=", userId)
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirstOrThrow()

    expect(row.pageId).toBe(pageId)
    expect(row.completed).toBe(true)
  })

  test("returns HISTORY_ENTRY_NOT_FOUND when chapter has not been opened", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/history`, {
      method: "PATCH",
      headers,
      json: { completed: true },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("HISTORY_ENTRY_NOT_FOUND")
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000/history`, {
      method: "PATCH",
      headers,
      json: { completed: true },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an empty body", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/history`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/history`, {
      method: "PATCH",
      json: { completed: true },
    })

    expect(res.status).toBe(401)
  })
})
