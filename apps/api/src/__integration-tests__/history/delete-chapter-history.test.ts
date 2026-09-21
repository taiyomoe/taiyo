import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

describe("DELETE /users/me/history/:chapterId", () => {
  test("removes the entry", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userHistories")
      .values({ userId, chapterId: SEEDED_CHAPTER_ID })
      .execute()

    const res = await api(app, `/users/me/history/${SEEDED_CHAPTER_ID}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userHistories")
      .selectAll()
      .where("userId", "=", userId)
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns HISTORY_ENTRY_NOT_FOUND when no entry exists", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/history/${randomUUID()}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("HISTORY_ENTRY_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/history/${randomUUID()}`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/history/not-a-uuid`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(422)
  })
})
