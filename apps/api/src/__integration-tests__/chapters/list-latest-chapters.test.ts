import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

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
const getTotal = (meta: Record<string, unknown> | undefined) => (meta as { total: number }).total

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

    const newest = before.body.data[0]!

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

    const { mediaId } = before.body.data[0]!
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
})
