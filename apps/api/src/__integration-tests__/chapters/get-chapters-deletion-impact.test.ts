import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /chapters/deletion-impact", () => {
  test("counts what deleting the chapters together affects", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const reader = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const groupId = await seedGroup(services, userId, "Shared Scans")
    const first = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      groupIds: [groupId],
      pages: [{ id: randomUUID() }, { id: randomUUID() }],
    })
    const second = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 2,
      groupIds: [groupId],
      pages: [{ id: randomUUID() }],
    })

    await seedHistory(services, reader.userId, first)
    await seedHistory(services, reader.userId, second)

    const res = await api(app, `/chapters/deletion-impact?ids=${first},${second}`, { headers })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      pages: 3,
      readers: 1,
      bookmarks: 0,
      comments: 0,
      openPageReports: 0,
      groups: 1,
    })
  })

  test("counts nothing for the chapters the caller cannot delete", async ({ app, services }) => {
    const owner = await signInAs(services, { role: "ADMIN" })
    const { headers } = await signInAs(services)
    const mediaId = await seedMedia(services, owner.userId)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: owner.userId,
      number: 1,
      pages: [{ id: randomUUID() }],
    })
    const res = await api(app, `/chapters/deletion-impact?ids=${chapterId}`, { headers })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toMatchObject({ pages: 0 })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/deletion-impact?ids=${randomUUID()}`)

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/chapters/deletion-impact?ids=${randomUUID()}`, { headers })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a malformed ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/chapters/deletion-impact?ids=nope", { headers })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
