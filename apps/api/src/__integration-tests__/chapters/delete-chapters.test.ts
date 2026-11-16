import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /chapters", () => {
  test("deletes the chapters and reports the missing ones", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const mediaId = await seedMedia(services, userId)
    const first = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
    const second = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 2,
      status: "PENDING",
    })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/chapters", {
      method: "DELETE",
      headers,
      json: { chapterIds: [first, second, missing] },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      done: [first, second],
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })

    const rows = await services.db
      .selectFrom("chapters")
      .select(["deletedAt", "deleterId"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows.every((row) => row.deletedAt !== null && row.deleterId === userId)).toBe(true)
  })

  test("skips the chapters the caller cannot delete", async ({ app, services }) => {
    const owner = await signInAs(services, { role: "ADMIN" })
    const { headers } = await signInAs(services)
    const mediaId = await seedMedia(services, owner.userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: owner.userId, number: 1 })
    const res = await api<BulkResult>(app, "/chapters", {
      method: "DELETE",
      headers,
      json: { chapterIds: [chapterId] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [],
      skipped: [{ id: chapterId, reason: "FORBIDDEN" }],
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/chapters", {
      method: "DELETE",
      json: { chapterIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/chapters", {
      method: "DELETE",
      headers,
      json: { chapterIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/chapters", { method: "DELETE", headers, json: { chapterIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
