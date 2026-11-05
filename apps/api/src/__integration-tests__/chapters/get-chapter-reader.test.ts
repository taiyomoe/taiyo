import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type Reader = {
  chapters: Array<{
    id: string
    number: number
    language: string
    isExternal: boolean
    pageCount: number
    groups: Array<{ id: string; name: string }>
  }>
  history: { pageId: string | null; completed: boolean } | null
}

const seedCatalog = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)

  return { mediaId, uploaderId }
}
const getReader = async (
  app: Parameters<typeof api>[0],
  path: string,
  headers: Record<string, string> = {},
) => {
  const res = await api<Reader>(app, path, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("GET /chapters/:id/reader", () => {
  test("lists the media's chapters by number with their groups and page counts", async ({
    app,
    services,
  }) => {
    const chapter = await seedCatalog(services)
    const groupId = await seedGroup(services, chapter.uploaderId, `reader-${randomUUID()}`)
    const two = await seedChapter(services, { ...chapter, number: 2 })
    const one = await seedChapter(services, {
      ...chapter,
      number: 1,
      groupIds: [groupId],
      pages: [{ id: randomUUID() }, { id: randomUUID() }],
    })
    const data = await getReader(app, `/chapters/${one}/reader`)

    expect(data.chapters.map((row) => row.id)).toEqual([one, two])
    expect(data.chapters[0]).toMatchObject({ pageCount: 2, groups: [{ id: groupId }] })
    expect(data.chapters[1]).toMatchObject({ pageCount: 0, groups: [] })
    expect(data.history).toBeNull()
  })

  test("filters by content rating but always keeps the requested chapter", async ({
    app,
    services,
  }) => {
    const chapter = await seedCatalog(services)
    const normal = await seedChapter(services, { ...chapter, number: 1 })
    const nsfw = await seedChapter(services, { ...chapter, number: 2, contentRating: "NSFW" })
    const other = await seedChapter(services, { ...chapter, number: 3, contentRating: "NSFW" })
    const fromNormal = await getReader(app, `/chapters/${normal}/reader?contentRating=NORMAL`)
    const fromNsfw = await getReader(app, `/chapters/${nsfw}/reader?contentRating=NORMAL`)

    expect(fromNormal.chapters.map((row) => row.id)).toEqual([normal])
    expect(fromNsfw.chapters.map((row) => row.id)).toEqual([normal, nsfw])
    expect(fromNsfw.chapters.map((row) => row.id)).not.toContain(other)
  })

  test("returns only the signed-in viewer's own progress", async ({ app, services }) => {
    const chapter = await seedCatalog(services)
    const id = await seedChapter(services, { ...chapter, number: 1 })
    const pageId = randomUUID()
    const reader = await signInAs(services)
    const stranger = await signInAs(services)

    await services.db
      .insertInto("userHistories")
      .values({ userId: reader.userId, chapterId: id, pageId, completed: false })
      .execute()

    const own = await getReader(app, `/chapters/${id}/reader`, reader.headers)
    const other = await getReader(app, `/chapters/${id}/reader`, stranger.headers)

    expect(own.history).toEqual({ pageId, completed: false })
    expect(other.history).toBeNull()
  })

  test("hides unpublished chapters from people who cannot view them", async ({ app, services }) => {
    const chapter = await seedCatalog(services)
    const id = await seedChapter(services, { ...chapter, number: 1, status: "PENDING" })
    const res = await api(app, `/chapters/${id}/reader`)

    expect(res.status).toBe(404)
  })
})
