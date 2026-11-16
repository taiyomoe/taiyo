import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /chapters", () => {
  test("sets the volume and language of every chapter", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const first = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
    const second = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 2,
      volume: "1",
    })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [first, second, missing], volume: "3", language: "pt_br" },
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
      .select(["volume", "language"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toEqual([
      { volume: "3", language: "pt_br" },
      { volume: "3", language: "pt_br" },
    ])
  })

  test("replaces the credited groups", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const before = await seedGroup(services, userId, "Before Scans")
    const after = await seedGroup(services, userId, "After Scans")
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      groupIds: [before],
    })
    const res = await api<BulkResult>(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [chapterId], groupIds: [after] },
    })

    expect(res.status).toBe(200)

    const groups = await services.db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", chapterId)
      .execute()

    expect(groups).toEqual([{ groupId: after }])
  })

  test("skips the chapters the caller cannot update", async ({ app, services }) => {
    const owner = await signInAs(services, { role: "ADMIN" })
    const { headers } = await signInAs(services)
    const mediaId = await seedMedia(services, owner.userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: owner.userId, number: 1 })
    const res = await api<BulkResult>(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [chapterId], volume: "9" },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [],
      skipped: [{ id: chapterId, reason: "FORBIDDEN" }],
    })

    const row = await services.db
      .selectFrom("chapters")
      .select("volume")
      .where("id", "=", chapterId)
      .executeTakeFirstOrThrow()

    expect(row.volume).toBeNull()
  })

  test("rejects an unknown group with GROUP_NOT_FOUND", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })
    const res = await api(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [chapterId], groupIds: [randomUUID()] },
    })

    expectFailure(res, 404, "GROUP_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/chapters", {
      method: "PATCH",
      json: { chapterIds: [randomUUID()], volume: "1" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [randomUUID()], volume: "1" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a request without any field with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/chapters", {
      method: "PATCH",
      headers,
      json: { chapterIds: [randomUUID()] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
