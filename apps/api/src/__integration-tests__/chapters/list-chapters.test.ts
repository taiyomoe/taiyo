import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

type ChapterRow = {
  id: string
  title: string | null
  number: number
  volume: string | null
  language: string
  contentRating: string
  flag: string
  read: boolean
  createdAt: string
  groups: Array<{ id: string; name: string }>
  uploader: { id: string; username: string; displayUsername: string; image: string | null }
}

const at = (minute: number) => new Date(Date.UTC(2026, 0, 1, 0, minute))
const seedCatalog = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const alpha = await seedGroup(services, uploaderId, "Alpha")
  const beta = await seedGroup(services, uploaderId, "Beta")
  const chapter = { mediaId, uploaderId }
  const one = await seedChapter(services, {
    ...chapter,
    number: 1,
    volume: "1",
    title: "The Beginning",
    createdAt: at(5),
    groupIds: [alpha],
  })
  const onePt = await seedChapter(services, {
    ...chapter,
    number: 1,
    language: "pt_br",
    volume: "1",
    createdAt: at(1),
    groupIds: [beta],
  })
  const two = await seedChapter(services, {
    ...chapter,
    number: 2,
    volume: "1",
    createdAt: at(2),
    groupIds: [beta, alpha],
  })
  const ten = await seedChapter(services, {
    ...chapter,
    number: 10,
    volume: "2",
    title: "Tenth Night",
    createdAt: at(4),
  })
  const eleven = await seedChapter(services, {
    ...chapter,
    number: 11,
    createdAt: at(3),
    groupIds: [beta],
  })
  const nsfw = await seedChapter(services, {
    ...chapter,
    number: 12,
    contentRating: "NSFW",
    createdAt: at(6),
  })
  const deleted = await seedChapter(services, { ...chapter, number: 13, createdAt: at(7) })

  await services.db
    .updateTable("chapters")
    .set({ deletedAt: new Date(), deleterId: uploaderId })
    .where("id", "=", deleted)
    .execute()

  return { mediaId, uploaderId, alpha, beta, one, onePt, two, ten, eleven, nsfw }
}
const listChapters = async (
  app: Parameters<typeof api>[0],
  mediaId: string,
  query = "",
  headers: Record<string, string> = {},
) => {
  const res = await api<ChapterRow[]>(app, `/medias/${mediaId}/chapters?perPage=100&${query}`, {
    headers,
  })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return { rows: res.body.data, ids: res.body.data.map((row) => row.id), meta: res.body.meta }
}

describe("GET /medias/:id/chapters", () => {
  test("returns the chapters of a media", async ({ app }) => {
    const res = await api<ChapterRow[]>(app, `/medias/${SEEDED_MEDIA_ID}/chapters?perPage=100`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.some((c) => c.id === SEEDED_CHAPTER_ID)).toBe(true)
  })

  test("returns the groups, uploader, upload date and flag of each chapter", async ({
    app,
    services,
  }) => {
    const catalog = await seedCatalog(services)
    const { rows } = await listChapters(app, catalog.mediaId)
    const row = defined(rows.find((chapter) => chapter.id === catalog.two))

    expect(row).toMatchObject({
      number: 2,
      volume: "1",
      title: null,
      language: "en",
      contentRating: "NORMAL",
      flag: "OK",
      read: false,
      createdAt: at(2).toISOString(),
      groups: [
        { id: catalog.alpha, name: "Alpha" },
        { id: catalog.beta, name: "Beta" },
      ],
    })
    expect(row.uploader.id).toBe(catalog.uploaderId)
    expect(row.uploader.username).toEqual(expect.any(String))
    expect(defined(rows.find((chapter) => chapter.id === catalog.ten)).groups).toEqual([])
  })

  test("orders by number then language, ascending by default", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { ids, meta } = await listChapters(app, catalog.mediaId)

    expect(ids).toEqual([catalog.one, catalog.onePt, catalog.two, catalog.ten, catalog.eleven])
    expect(meta).toMatchObject({ page: 1, perPage: 100, total: 5 })
  })

  test("orders by number descending", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { ids } = await listChapters(app, catalog.mediaId, "order=desc")

    expect(ids).toEqual([catalog.eleven, catalog.ten, catalog.two, catalog.one, catalog.onePt])
  })

  test("orders by upload date in both directions", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const ascending = await listChapters(app, catalog.mediaId, "sort=createdAt")
    const descending = await listChapters(app, catalog.mediaId, "sort=createdAt&order=desc")

    expect(ascending.ids).toEqual([
      catalog.onePt,
      catalog.two,
      catalog.eleven,
      catalog.ten,
      catalog.one,
    ])
    expect(descending.ids).toEqual([
      catalog.one,
      catalog.ten,
      catalog.eleven,
      catalog.two,
      catalog.onePt,
    ])
  })

  test("paginates and reports the total", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const res = await api<ChapterRow[]>(app, `/medias/${catalog.mediaId}/chapters?page=2&perPage=2`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((row) => row.id)).toEqual([catalog.two, catalog.ten])
    expect(res.body.meta).toMatchObject({ page: 2, perPage: 2, total: 5 })
  })

  test("filters by language", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { ids, meta } = await listChapters(app, catalog.mediaId, "language=pt_br")

    expect(ids).toEqual([catalog.onePt])
    expect(meta).toMatchObject({ total: 1 })
  })

  test("filters by volume", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const first = await listChapters(app, catalog.mediaId, "volume=1")
    const second = await listChapters(app, catalog.mediaId, "volume=2")
    const missing = await listChapters(app, catalog.mediaId, "volume=3")

    expect(first.ids).toEqual([catalog.one, catalog.onePt, catalog.two])
    expect(second.ids).toEqual([catalog.ten])
    expect(missing.ids).toEqual([])
  })

  test("filters chapters without a volume with volume=none", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { ids, meta } = await listChapters(app, catalog.mediaId, "volume=none")

    expect(ids).toEqual([catalog.eleven])
    expect(meta).toMatchObject({ total: 1 })
  })

  test("combines filters", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { ids, meta } = await listChapters(
      app,
      catalog.mediaId,
      "language=en&volume=1&order=desc",
    )

    expect(ids).toEqual([catalog.two, catalog.one])
    expect(meta).toMatchObject({ total: 2 })
  })

  test("searches by the start of the chapter number", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const one = await listChapters(app, catalog.mediaId, "search=1")
    const eleven = await listChapters(app, catalog.mediaId, "search=11")

    expect(one.ids).toEqual([catalog.one, catalog.onePt, catalog.ten, catalog.eleven])
    expect(eleven.ids).toEqual([catalog.eleven])
  })

  test("searches the title case-insensitively", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const tenth = await listChapters(app, catalog.mediaId, "search=tENTH")
    const begin = await listChapters(app, catalog.mediaId, "search=%20beginning%20")

    expect(tenth.ids).toEqual([catalog.ten])
    expect(begin.ids).toEqual([catalog.one])
  })

  test("treats like wildcards in the search literally", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const percent = await listChapters(app, catalog.mediaId, "search=%25")
    const underscore = await listChapters(app, catalog.mediaId, "search=_")

    expect(percent.ids).toEqual([])
    expect(underscore.ids).toEqual([])
  })

  test("ignores a blank search", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { meta } = await listChapters(app, catalog.mediaId, "search=%20%20")

    expect(meta).toMatchObject({ total: 5 })
  })

  test("defaults to normal and suggestive chapters", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const defaults = await listChapters(app, catalog.mediaId)
    const nsfw = await listChapters(app, catalog.mediaId, "contentRating=NSFW")
    const both = await listChapters(app, catalog.mediaId, "contentRating=NORMAL,NSFW")

    expect(defaults.ids).not.toContain(catalog.nsfw)
    expect(nsfw.ids).toEqual([catalog.nsfw])
    expect(both.meta).toMatchObject({ total: 6 })
  })

  test("rates a chapter as the stricter of itself and its media", async ({ app, services }) => {
    const catalog = await seedCatalog(services)

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFW" })
      .where("id", "=", catalog.mediaId)
      .execute()

    const defaults = await listChapters(app, catalog.mediaId)
    const nsfw = await listChapters(app, catalog.mediaId, "contentRating=NSFW")

    expect(defaults.ids).toEqual([])
    expect(defaults.meta).toMatchObject({ total: 0 })
    expect(nsfw.meta).toMatchObject({ total: 6 })
  })

  test("excludes deleted chapters", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { rows } = await listChapters(app, catalog.mediaId, "contentRating=NORMAL,NSFW")

    expect(rows.some((row) => row.number === 13)).toBe(false)
  })

  test("leaves out groups that were deleted", async ({ app, services }) => {
    const catalog = await seedCatalog(services)

    await services.db
      .updateTable("groups")
      .set({ deletedAt: new Date() })
      .where("id", "=", catalog.alpha)
      .execute()

    const { rows } = await listChapters(app, catalog.mediaId)

    expect(defined(rows.find((row) => row.id === catalog.two)).groups).toEqual([
      { id: catalog.beta, name: "Beta" },
    ])
  })

  test("marks every chapter sharing a read number as read", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.one)

    const { rows } = await listChapters(app, catalog.mediaId, "", headers)
    const readIds = rows.filter((row) => row.read).map((row) => row.id)

    expect(readIds).toEqual([catalog.one, catalog.onePt])
  })

  test("does not count history of deleted chapters or other medias", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)
    const deletedTwo = await seedChapter(services, {
      mediaId: catalog.mediaId,
      uploaderId: catalog.uploaderId,
      number: 2,
      language: "fr",
    })
    const otherMediaId = await seedMedia(services, catalog.uploaderId)
    const otherTen = await seedChapter(services, {
      mediaId: otherMediaId,
      uploaderId: catalog.uploaderId,
      number: 10,
    })

    await seedHistory(services, userId, deletedTwo)
    await seedHistory(services, userId, otherTen)
    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date(), deleterId: catalog.uploaderId })
      .where("id", "=", deletedTwo)
      .execute()

    const { rows } = await listChapters(app, catalog.mediaId, "", headers)

    expect(rows.every((row) => !row.read)).toBe(true)
  })

  test("does not mark chapters read from another user's history", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const other = await signInAs(services)
    const { headers } = await signInAs(services)

    await seedHistory(services, other.userId, catalog.one)

    const { rows } = await listChapters(app, catalog.mediaId, "", headers)

    expect(rows.every((row) => !row.read)).toBe(true)
  })

  test("reports nothing as read when signed out", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.one)

    const { rows } = await listChapters(app, catalog.mediaId)

    expect(rows.every((row) => !row.read)).toBe(true)
  })

  test("lists only unread chapter numbers with unread=true", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.onePt)
    await seedHistory(services, userId, catalog.ten)

    const { ids, meta } = await listChapters(app, catalog.mediaId, "unread=true", headers)

    expect(ids).toEqual([catalog.two, catalog.eleven])
    expect(meta).toMatchObject({ total: 2 })
  })

  test("lists every chapter with unread=false", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.one)

    const signedIn = await listChapters(app, catalog.mediaId, "unread=false", headers)
    const signedOut = await listChapters(app, catalog.mediaId, "unread=false")

    expect(signedIn.meta).toMatchObject({ total: 5 })
    expect(signedOut.meta).toMatchObject({ total: 5 })
  })

  test("returns UNAUTHORIZED for unread=true when signed out", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const res = await api(app, `/medias/${catalog.mediaId}/chapters?unread=true`)

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/chapters`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns MEDIA_NOT_FOUND for a deleted media", async ({ app, services }) => {
    const catalog = await seedCatalog(services)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", catalog.mediaId)
      .execute()

    const res = await api(app, `/medias/${catalog.mediaId}/chapters`)

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid/chapters`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test.for([
    "sort=title",
    "order=up",
    "language=xx",
    "volume=",
    "unread=maybe",
    "contentRating=SPICY",
    "perPage=500",
  ])("returns VALIDATION_ERROR for %s", async (query, { app }) => {
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters?${query}`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
