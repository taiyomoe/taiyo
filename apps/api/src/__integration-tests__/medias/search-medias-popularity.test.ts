import type { Hono } from "hono"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const TIMEOUT = 30_000

type MediaHit = { id: string; libraryCount: number; chapterCount: number }
type CountField = "libraryCount" | "chapterCount"

const getSearchHeaders = () => ({ "x-forwarded-for": `198.51.100.${randomUUID()}` })
const isMonotonic = (values: number[], direction: "asc" | "desc") =>
  values.every((value, i) => {
    const previous = values[i - 1]

    if (previous === undefined) {
      return true
    }

    return direction === "desc" ? previous >= value : previous <= value
  })
const waitForCount = async (
  { meili, mediasIndex }: Services,
  mediaId: string,
  field: CountField,
  expected: number,
  { attempts = 100, intervalMs = 100 } = {},
) => {
  let last: number | undefined

  for (let i = 0; i < attempts; i++) {
    const doc = await meili
      .index<MediaHit>(mediasIndex)
      .getDocument(mediaId)
      .catch(() => null)

    last = doc?.[field]

    if (last === expected) {
      return
    }

    await new Promise<void>((r) => setTimeout(r, intervalMs))
  }

  throw new Error(`${field} for ${mediaId} settled at ${last}, expected ${expected}`)
}
const search = async (app: Hono, json: Record<string, unknown>) => {
  const res = await api<MediaHit[]>(app, "/medias/search", {
    method: "POST",
    headers: getSearchHeaders(),
    json: { perPage: 100, ...json },
  })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const searchSorted = (app: Hono, field: CountField, direction: "asc" | "desc") =>
  search(app, { sort: [{ field, direction }] })
const getHit = async (app: Hono, mediaId: string) => {
  const hit = (await searchSorted(app, "libraryCount", "desc")).find((h) => h.id === mediaId)

  if (!hit) {
    throw new Error(`${mediaId} is missing from the search results`)
  }

  return hit
}
const getDbCounts = async ({ db }: Services, mediaId: string) => {
  const [library, chapters] = await Promise.all([
    db
      .selectFrom("userLibraryEntries")
      .select(db.fn.countAll<number>().as("count"))
      .where("mediaId", "=", mediaId)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("chapters")
      .select(db.fn.countAll<number>().as("count"))
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .executeTakeFirstOrThrow(),
  ])

  return { libraryCount: Number(library.count), chapterCount: Number(chapters.count) }
}
const addToLibrary = async (app: Hono, services: Services, mediaId: string) => {
  const { headers } = await signInAs(services)
  const res = await api(app, `/users/me/library/${mediaId}`, {
    method: "PUT",
    headers,
    json: { status: "READING" },
  })

  expect(res.status).toBe(200)
}

describe("POST /medias/search popularity sorts", () => {
  test(
    "orders results by libraryCount descending",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)

      const [mostPopular, lessPopular] = (await searchSorted(app, "libraryCount", "desc")).map(
        (hit) => hit.id,
      )

      if (!mostPopular || !lessPopular) {
        throw new Error("Expected at least two indexed medias")
      }

      await addToLibrary(app, services, mostPopular)
      await addToLibrary(app, services, mostPopular)
      await addToLibrary(app, services, lessPopular)
      await waitForCount(services, mostPopular, "libraryCount", 2)
      await waitForCount(services, lessPopular, "libraryCount", 1)

      const hits = await searchSorted(app, "libraryCount", "desc")

      expect(
        isMonotonic(
          hits.map((hit) => hit.libraryCount),
          "desc",
        ),
      ).toBe(true)
      expect(hits.slice(0, 2).map((hit) => hit.id)).toStrictEqual([mostPopular, lessPopular])
    },
    TIMEOUT,
  )

  test(
    "orders results by chapterCount in both directions",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)

      const descending = (await searchSorted(app, "chapterCount", "desc")).map(
        (hit) => hit.chapterCount,
      )
      const ascending = (await searchSorted(app, "chapterCount", "asc")).map(
        (hit) => hit.chapterCount,
      )

      expect(new Set(descending).size).toBeGreaterThan(1)
      expect(isMonotonic(descending, "desc")).toBe(true)
      expect(isMonotonic(ascending, "asc")).toBe(true)
    },
    TIMEOUT,
  )

  test(
    "filters by a minimum chapterCount",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)

      const all = (await searchSorted(app, "chapterCount", "desc")).map((hit) => hit.chapterCount)
      const threshold = all[Math.floor(all.length / 2)]!
      const filtered = await search(app, { filter: { chapterCount: { gte: threshold } } })

      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered.every((hit) => hit.chapterCount >= threshold)).toBe(true)
      expect(filtered).toHaveLength(all.filter((count) => count >= threshold).length)
    },
    TIMEOUT,
  )
})

describe("POST /medias/search popularity counts", () => {
  test(
    "libraryCount matches the number of library entries",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)
      await addToLibrary(app, services, SEEDED_MEDIA_ID)
      await addToLibrary(app, services, SEEDED_MEDIA_ID)
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 2)

      const hit = await getHit(app, SEEDED_MEDIA_ID)

      expect(hit.libraryCount).toBe(2)
      expect(hit.libraryCount).toBe((await getDbCounts(services, SEEDED_MEDIA_ID)).libraryCount)
    },
    TIMEOUT,
  )

  test(
    "chapterCount matches the database and excludes deleted chapters",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)

      const before = await getHit(app, SEEDED_MEDIA_ID)

      expect(before.chapterCount).toBeGreaterThan(0)
      expect(before.chapterCount).toBe((await getDbCounts(services, SEEDED_MEDIA_ID)).chapterCount)

      const chapter = await services.db
        .selectFrom("chapters")
        .select("id")
        .where("mediaId", "=", SEEDED_MEDIA_ID)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow()

      await services.db
        .updateTable("chapters")
        .set({ deletedAt: new Date() })
        .where("id", "=", chapter.id)
        .execute()

      const { headers } = await signInAs(services, { role: "ADMIN" })
      const reindex = await api(app, `/medias/${SEEDED_MEDIA_ID}/reindex`, {
        method: "POST",
        headers,
      })

      expect(reindex.status).toBe(201)

      await waitForCount(services, SEEDED_MEDIA_ID, "chapterCount", before.chapterCount - 1)

      const after = await getHit(app, SEEDED_MEDIA_ID)

      expect(after.chapterCount).toBe(before.chapterCount - 1)
      expect(after.chapterCount).toBe((await getDbCounts(services, SEEDED_MEDIA_ID)).chapterCount)
    },
    TIMEOUT,
  )

  test(
    "reports zero for a media nobody has in their library",
    async ({ app, services }) => {
      await waitForCount(services, SEEDED_MEDIA_ID, "libraryCount", 0)

      const hit = await getHit(app, SEEDED_MEDIA_ID)

      expect((await getDbCounts(services, SEEDED_MEDIA_ID)).libraryCount).toBe(0)
      expect(hit.libraryCount).toBe(0)
      expect(hit.libraryCount).not.toBeNull()
    },
    TIMEOUT,
  )
})
