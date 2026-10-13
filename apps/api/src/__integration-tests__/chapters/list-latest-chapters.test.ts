import { describe, expect } from "vitest"
import { defined } from "../helpers/assert"
import { api } from "../helpers/request"
import { test } from "../setup"

type FeedRow = {
  id: string
  number: number
  language: string
  contentRating: string
  createdAt: string
  mediaId: string
  mediaTitle: string | null
  mediaCoverUrl: string | null
  groups: Array<{ id: string; name: string }>
  uploader: { id: string; username: string; displayUsername: string; image: string | null }
}

const listIds = async (app: Parameters<typeof api>[0], query: string) => {
  const res = await api<FeedRow[]>(app, `/chapters/latest?perPage=100&${query}`)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return { ids: res.body.data.map((row) => row.id), total: getTotal(res.body.meta) }
}
const isDescending = (rows: FeedRow[]) =>
  rows.every((row, index) => {
    if (index === 0) {
      return true
    }

    const previous = defined(rows[index - 1])

    return previous.createdAt === row.createdAt
      ? previous.id > row.id
      : previous.createdAt > row.createdAt
  })
const getTotal = (meta: Record<string, unknown> | undefined) => {
  const total = meta?.total

  if (typeof total !== "number") {
    throw new Error("Expected a numeric total")
  }

  return total
}

describe("GET /chapters/latest", () => {
  test("returns the latest chapters", async ({ app }) => {
    const res = await api<FeedRow[]>(app, `/chapters/latest?page=1&perPage=5`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(5)
    expect(res.body.meta).toMatchObject({ page: 1, perPage: 5 })
    expect(getTotal(res.body.meta)).toBeGreaterThan(5)

    for (const row of res.body.data) {
      expect(row.mediaId).toEqual(expect.any(String))
      expect(row.mediaTitle).toEqual(expect.any(String))
    }
  })

  test("is not shadowed by the chapter detail route", async ({ app }) => {
    const res = await api(app, `/chapters/latest`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }
  })

  test("orders by release date descending, breaking ties on id", async ({ app }) => {
    const res = await api<FeedRow[]>(app, `/chapters/latest?perPage=100`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(isDescending(res.body.data)).toBe(true)
  })

  test("does not repeat or drop rows across pages", async ({ app }) => {
    const [first, second] = await Promise.all([
      api<FeedRow[]>(app, `/chapters/latest?page=1&perPage=20`),
      api<FeedRow[]>(app, `/chapters/latest?page=2&perPage=20`),
    ])

    if (!first.body.success || !second.body.success) {
      throw new Error("Expected success")
    }

    const combined = [...first.body.data, ...second.body.data]

    expect(new Set(combined.map((row) => row.id)).size).toBe(combined.length)
    expect(isDescending(combined)).toBe(true)
  })

  test("excludes deleted chapters", async ({ app, services }) => {
    const before = await api<FeedRow[]>(app, `/chapters/latest?perPage=1`)

    if (!before.body.success) {
      throw new Error("Expected success")
    }

    const newest = defined(before.body.data[0])

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date() })
      .where("id", "=", newest.id)
      .execute()

    const after = await api<FeedRow[]>(app, `/chapters/latest?perPage=5`)

    if (!after.body.success) {
      throw new Error("Expected success")
    }

    expect(after.body.data.some((row) => row.id === newest.id)).toBe(false)
    expect(getTotal(after.body.meta)).toBe(getTotal(before.body.meta) - 1)
  })

  test("excludes chapters of deleted medias", async ({ app, services }) => {
    const before = await api<FeedRow[]>(app, `/chapters/latest?perPage=1`)

    if (!before.body.success) {
      throw new Error("Expected success")
    }

    const { mediaId } = defined(before.body.data[0])
    const liveChapters = await services.db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .execute()

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    const after = await api<FeedRow[]>(app, `/chapters/latest?perPage=100`)

    if (!after.body.success) {
      throw new Error("Expected success")
    }

    expect(after.body.data.some((row) => row.mediaId === mediaId)).toBe(false)
    expect(getTotal(after.body.meta)).toBe(getTotal(before.body.meta) - liveChapters.length)
  })

  test("does not return chapter pages", async ({ app }) => {
    const res = await api<FeedRow[]>(app, `/chapters/latest?perPage=10`)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    for (const row of res.body.data) {
      expect(row).not.toHaveProperty("pages")
    }
  })

  test("returns VALIDATION_ERROR for an out-of-range perPage", async ({ app }) => {
    const res = await api(app, `/chapters/latest?perPage=500`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns the cover, groups and uploader of each chapter", async ({ app, services }) => {
    const credited = await services.db
      .selectFrom("chapterGroups")
      .innerJoin("chapters", "chapters.id", "chapterGroups.chapterId")
      .innerJoin("groups", "groups.id", "chapterGroups.groupId")
      .select(["chapters.id", "chapters.mediaId", "chapters.uploaderId", "groups.name"])
      .executeTakeFirstOrThrow()
    const res = await api<FeedRow[]>(
      app,
      `/chapters/latest?perPage=100&mediaId=${credited.mediaId}`,
    )

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    const row = defined(res.body.data.find((chapter) => chapter.id === credited.id))

    expect(row.groups.map((group) => group.name)).toContain(credited.name)
    expect(row.uploader.id).toBe(credited.uploaderId)
    expect(row.uploader.username).toEqual(expect.any(String))
    expect(row.mediaCoverUrl).toContain(`/medias/${credited.mediaId}/covers/`)
  })

  test("filters by media", async ({ app, services }) => {
    const { mediaId } = await services.db
      .selectFrom("chapters")
      .select("mediaId")
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow()
    const res = await api<FeedRow[]>(app, `/chapters/latest?perPage=100&mediaId=${mediaId}`)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.every((row) => row.mediaId === mediaId)).toBe(true)
  })

  test("defaults to normal and suggestive chapters", async ({ app, services }) => {
    const { mediaId } = await services.db
      .selectFrom("chapters")
      .select("mediaId")
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow()

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFW" })
      .where("id", "=", mediaId)
      .execute()

    const defaults = await listIds(app, `mediaId=${mediaId}`)
    const nsfw = await listIds(app, `mediaId=${mediaId}&contentRating=NSFW`)

    expect(defaults.total).toBe(0)
    expect(nsfw.total).toBeGreaterThan(0)
  })

  test("rates a chapter as the stricter of itself and its media", async ({ app, services }) => {
    const [normalChapter, nsfwChapter] = await services.db
      .selectFrom("chapters")
      .select(["id", "mediaId"])
      .where("deletedAt", "is", null)
      .orderBy("createdAt", "desc")
      .orderBy("id", "desc")
      .limit(2)
      .execute()
    const media = defined(normalChapter).mediaId

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NORMAL" })
      .where("id", "=", media)
      .execute()
    await services.db
      .updateTable("chapters")
      .set({ contentRating: "NORMAL" })
      .where("mediaId", "=", media)
      .execute()
    await services.db
      .updateTable("chapters")
      .set({ contentRating: "NSFW" })
      .where("id", "=", defined(nsfwChapter).id)
      .execute()

    const normal = await listIds(app, `mediaId=${media}&contentRating=NORMAL`)
    const nsfw = await listIds(app, `mediaId=${media}&contentRating=NSFW`)

    expect(normal.ids).not.toContain(defined(nsfwChapter).id)
    expect(nsfw.ids).toContain(defined(nsfwChapter).id)

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFW" })
      .where("id", "=", media)
      .execute()

    const nsfwMedia = await listIds(app, `mediaId=${media}&contentRating=NSFW`)
    const normalOnly = await listIds(app, `mediaId=${media}&contentRating=NORMAL`)

    expect(nsfwMedia.ids).toContain(defined(normalChapter).id)
    expect(normalOnly.total).toBe(0)
  })

  test("combines several content ratings", async ({ app }) => {
    const normal = await listIds(app, "contentRating=NORMAL")
    const nsfw = await listIds(app, "contentRating=NSFW")
    const both = await listIds(app, "contentRating=NSFW,NORMAL")

    expect(both.total).toBe(normal.total + nsfw.total)
  })

  test("returns VALIDATION_ERROR for a page past the cap", async ({ app }) => {
    const res = await api(app, `/chapters/latest?page=100000000000000000000`)

    expect(res.status).toBe(422)
  })

  test("returns VALIDATION_ERROR for an unknown content rating", async ({ app }) => {
    const res = await api(app, `/chapters/latest?contentRating=NORMAL,SPICY`)

    expect(res.status).toBe(422)
  })
})
