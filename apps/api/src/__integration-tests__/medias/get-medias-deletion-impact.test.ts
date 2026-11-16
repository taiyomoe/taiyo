import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /medias/deletion-impact", () => {
  test("counts what deleting the medias together affects", async ({ app, services }) => {
    const { db } = services
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const reader = await signInAs(services)
    const first = await seedMedia(services, userId)
    const second = await seedMedia(services, userId)
    const gone = await seedMedia(services, userId)
    const firstChapter = await seedChapter(services, {
      mediaId: first,
      uploaderId: userId,
      number: 1,
    })
    const secondChapter = await seedChapter(services, {
      mediaId: second,
      uploaderId: userId,
      number: 1,
    })

    await seedChapter(services, {
      mediaId: second,
      uploaderId: userId,
      number: 2,
      status: "PENDING",
    })
    await seedChapter(services, { mediaId: gone, uploaderId: userId, number: 1 })
    await db.updateTable("medias").set({ deletedAt: new Date() }).where("id", "=", gone).execute()
    await seedHistory(services, reader.userId, firstChapter)
    await seedHistory(services, reader.userId, secondChapter)
    await db
      .insertInto("userLibraryEntries")
      .values([
        { userId: reader.userId, mediaId: first, status: "READING" },
        { userId: reader.userId, mediaId: second, status: "COMPLETED" },
      ])
      .execute()
    await db.insertInto("featuredMedias").values({ mediaId: second, position: 99 }).execute()

    const res = await api(app, `/medias/deletion-impact?ids=${[first, second, gone].join(",")}`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toMatchObject({
      publishedChapters: 2,
      unpublishedChapters: 1,
      libraryEntries: 2,
      readers: 1,
      featured: 1,
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/deletion-impact?ids=${randomUUID()}`)

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/medias/deletion-impact?ids=${randomUUID()}`, { headers })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, `/medias/deletion-impact?ids=${randomUUID()}`, { headers })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a malformed ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/medias/deletion-impact?ids=nope", { headers })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
