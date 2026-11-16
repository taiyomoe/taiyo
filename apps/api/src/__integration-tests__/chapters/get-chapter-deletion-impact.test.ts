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

describe("GET /chapters/:id/deletion-impact", () => {
  test("counts what deleting the chapter affects", async ({ app, services }) => {
    const { db } = services
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const reader = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const groupId = await seedGroup(services, userId, "Qwzx Scans")
    const pageId = crypto.randomUUID()
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      groupIds: [groupId],
      pages: [{ id: pageId }, { id: crypto.randomUUID() }],
    })

    await seedHistory(services, reader.userId, chapterId)
    await db
      .insertInto("pageBookmarks")
      .values({ userId: reader.userId, chapterId, pageId })
      .execute()
    await db
      .insertInto("pageReports")
      .values({ reporterId: reader.userId, chapterId, pageId, reason: "BROKEN" })
      .execute()

    const thread = await db
      .insertInto("commentThreads")
      .values({ chapterId })
      .returning("id")
      .executeTakeFirstOrThrow()

    await db
      .insertInto("comments")
      .values({ threadId: thread.id, authorId: reader.userId, content: "Hi" })
      .execute()

    const res = await api(app, `/chapters/${chapterId}/deletion-impact`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      pages: 2,
      readers: 1,
      bookmarks: 1,
      comments: 1,
      openPageReports: 1,
      groups: 1,
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })

    expectFailure(await api(app, `/chapters/${chapterId}/deletion-impact`), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN", banned: true })
    const mediaId = await seedMedia(services, userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })

    expectFailure(
      await api(app, `/chapters/${chapterId}/deletion-impact`, { headers }),
      403,
      "FORBIDDEN",
    )
  })

  test("rejects users who cannot delete the chapter with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const chapterId = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })

    expectFailure(
      await api(app, `/chapters/${chapterId}/deletion-impact`, { headers }),
      403,
      "FORBIDDEN",
    )
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/chapters/00000000-0000-0000-0000-000000000000/deletion-impact", { headers }),
      404,
      "CHAPTER_NOT_FOUND",
    )
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/chapters/not-a-uuid/deletion-impact", { headers }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
