import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /medias/:id/deletion-impact", () => {
  test("counts what deleting the media affects", async ({ app, services }) => {
    const { db } = services
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const reader = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const published = await seedChapter(services, { mediaId, uploaderId: userId, number: 1 })

    await seedChapter(services, { mediaId, uploaderId: userId, number: 2 })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 3, status: "PENDING" })
    await seedChapter(services, { mediaId, uploaderId: userId, number: 4, status: "REJECTED" })
    await seedHistory(services, userId, published)
    await seedHistory(services, reader.userId, published)
    await db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()

    const list = await db
      .insertInto("userLists")
      .values({ userId: reader.userId, name: "Favorites" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await db.insertInto("userListItems").values({ listId: list.id, mediaId, position: 0 }).execute()
    await db.insertInto("featuredMedias").values({ mediaId, position: 99 }).execute()

    const threads = await db
      .insertInto("commentThreads")
      .values([{ mediaId }, { chapterId: published }])
      .returning("id")
      .execute()

    await db
      .insertInto("comments")
      .values(
        threads.map((thread) => ({ threadId: thread.id, authorId: reader.userId, content: "Hi" })),
      )
      .execute()

    const res = await api(app, `/medias/${mediaId}/deletion-impact`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      publishedChapters: 2,
      unpublishedChapters: 1,
      covers: 0,
      banners: 0,
      libraryEntries: 1,
      lists: 1,
      readers: 2,
      comments: 2,
      pendingSuggestions: 0,
      openPageReports: 0,
      featured: true,
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, `/medias/${SEEDED_MEDIA_ID}/deletion-impact`), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(
      await api(app, `/medias/${SEEDED_MEDIA_ID}/deletion-impact`, { headers }),
      403,
      "FORBIDDEN",
    )
  })

  test("rejects users who cannot delete medias with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })

    expectFailure(
      await api(app, `/medias/${SEEDED_MEDIA_ID}/deletion-impact`, { headers }),
      403,
      "FORBIDDEN",
    )
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/medias/00000000-0000-0000-0000-000000000000/deletion-impact", { headers }),
      404,
      "MEDIA_NOT_FOUND",
    )
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/medias/not-a-uuid/deletion-impact", { headers }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
