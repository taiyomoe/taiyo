import { sql } from "@taiyomoe/db"
import { describe, expect } from "vitest"
import { defined } from "../helpers/assert"
import { api } from "../helpers/request"
import { test } from "../setup"

type MediaUpdateRow = {
  id: string
  title: string | null
  coverUrl: string | null
  countryOfOrigin: string
  contentRating: string
  chapterCount: number
  chapters: Array<{ id: string; createdAt: string; groups: unknown[]; uploader: { id: string } }>
}

const listUpdates = async (app: Parameters<typeof api>[0], query = "") => {
  const res = await api<MediaUpdateRow[]>(app, `/chapters/latest/medias?${query}`)

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return { data: res.body.data, total: Number(res.body.meta?.total) }
}

describe("GET /chapters/latest/medias", () => {
  test("returns each media once with its five latest chapters", async ({ app }) => {
    const { data, total } = await listUpdates(app, "perPage=100")

    expect(data.length).toBeGreaterThan(0)
    expect(data).toHaveLength(total)
    expect(new Set(data.map((media) => media.id)).size).toBe(data.length)

    for (const media of data) {
      expect(media.title).toEqual(expect.any(String))
      expect(media.chapters.length).toBe(Math.min(5, media.chapterCount))
      expect(media.chapters.every((chapter) => !("mediaId" in chapter))).toBe(true)
      expect(media.chapters.every((chapter) => !("rank" in chapter))).toBe(true)
    }
  })

  test("orders medias by their latest chapter", async ({ app, services }) => {
    const { data } = await listUpdates(app, "perPage=100")
    const last = defined(data.at(-1))

    await services.db
      .updateTable("chapters")
      .set({ createdAt: sql`now() + interval '1 minute'` })
      .where("id", "=", defined(last.chapters.at(-1)).id)
      .execute()

    const after = await listUpdates(app, "perPage=1")

    expect(defined(after.data[0]).id).toBe(last.id)
    expect(defined(defined(after.data[0]).chapters[0]).id).toBe(defined(last.chapters.at(-1)).id)
  })

  test("honours chaptersPerMedia", async ({ app }) => {
    const { data } = await listUpdates(app, "perPage=100&chaptersPerMedia=2")

    for (const media of data) {
      expect(media.chapters.length).toBe(Math.min(2, media.chapterCount))
    }
  })

  test("does not repeat medias across pages", async ({ app }) => {
    const first = await listUpdates(app, "page=1&perPage=3")
    const second = await listUpdates(app, "page=2&perPage=3")
    const ids = [...first.data, ...second.data].map((media) => media.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  test("filters by content rating", async ({ app, services }) => {
    const { data } = await listUpdates(app, "perPage=1")
    const media = defined(data[0])

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFL" })
      .where("id", "=", media.id)
      .execute()

    const defaults = await listUpdates(app, "perPage=100")
    const nsfl = await listUpdates(app, "perPage=100&contentRating=NSFL")

    expect(defaults.data.some((update) => update.id === media.id)).toBe(false)
    expect(nsfl.data.map((update) => update.id)).toContain(media.id)
    expect(nsfl.data.every((update) => update.contentRating === "NSFL")).toBe(true)
  })

  test("returns an empty page when nothing matches", async ({ app, services }) => {
    await services.db.updateTable("medias").set({ contentRating: "NORMAL" }).execute()
    await services.db.updateTable("chapters").set({ contentRating: "NORMAL" }).execute()

    const { data, total } = await listUpdates(app, "contentRating=NSFL")

    expect(data).toEqual([])
    expect(total).toBe(0)
  })
})
