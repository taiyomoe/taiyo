import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const IN_LIBRARY_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const OUT_OF_LIBRARY_MEDIA_ID = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"
const IN_LIBRARY_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

type FeedRow = {
  id: string
  number: number
  language: string
  createdAt: string
  mediaId: string
  mediaTitle: string | null
}

const isDescending = (rows: FeedRow[]) =>
  rows.every((row, index) => {
    if (index === 0) {
      return true
    }

    const previous = rows[index - 1]!

    return previous.createdAt === row.createdAt
      ? previous.id > row.id
      : previous.createdAt > row.createdAt
  })

describe("GET /users/me/feed", () => {
  test("returns the chapters of the medias in the library", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: IN_LIBRARY_MEDIA_ID, status: "READING" })
      .execute()

    const liveChapters = await services.db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", IN_LIBRARY_MEDIA_ID)
      .where("deletedAt", "is", null)
      .execute()
    const res = await api<FeedRow[]>(app, `/users/me/feed?perPage=100`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.meta).toMatchObject({ page: 1, perPage: 100, total: liveChapters.length })
    expect(res.body.data.every((row) => row.mediaId === IN_LIBRARY_MEDIA_ID)).toBe(true)
    expect(res.body.data.some((row) => row.id === IN_LIBRARY_CHAPTER_ID)).toBe(true)

    for (const row of res.body.data) {
      expect(row.mediaTitle).toEqual(expect.any(String))
      expect(row).not.toHaveProperty("pages")
    }
  })

  test("excludes medias absent from the library", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: IN_LIBRARY_MEDIA_ID, status: "READING" })
      .execute()

    const res = await api<FeedRow[]>(app, `/users/me/feed?perPage=100`, { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.some((row) => row.mediaId === OUT_OF_LIBRARY_MEDIA_ID)).toBe(false)
  })

  test("orders by release date descending, breaking ties on id", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId, mediaId: IN_LIBRARY_MEDIA_ID, status: "READING" },
        { userId, mediaId: OUT_OF_LIBRARY_MEDIA_ID, status: "COMPLETED" },
      ])
      .execute()

    const res = await api<FeedRow[]>(app, `/users/me/feed?perPage=100`, { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(isDescending(res.body.data)).toBe(true)
  })

  test("excludes deleted chapters", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: IN_LIBRARY_MEDIA_ID, status: "READING" })
      .execute()

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date() })
      .where("id", "=", IN_LIBRARY_CHAPTER_ID)
      .execute()

    const res = await api<FeedRow[]>(app, `/users/me/feed?perPage=100`, { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.some((row) => row.id === IN_LIBRARY_CHAPTER_ID)).toBe(false)
  })

  test("excludes chapters of deleted medias", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: IN_LIBRARY_MEDIA_ID, status: "READING" })
      .execute()

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", IN_LIBRARY_MEDIA_ID)
      .execute()

    const res = await api<FeedRow[]>(app, `/users/me/feed?perPage=100`, { headers })

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(0)
  })

  test("returns an empty feed for a fresh user", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<FeedRow[]>(app, `/users/me/feed`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(0)
    expect(res.body.meta).toMatchObject({ total: 0 })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/feed`)

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/users/me/feed`, { headers })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an out-of-range perPage", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/feed?perPage=500`, { headers })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
