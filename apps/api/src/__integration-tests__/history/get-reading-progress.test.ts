import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedHistory, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type ChapterRef = {
  id: string
  number: number
  volume: string | null
  title: string | null
  language: string
}
type Progress = {
  readCount: number
  totalCount: number
  lastRead: (ChapterRef & { readAt: string }) | null
  next: ChapterRef | null
}

const at = (minute: number) => new Date(Date.UTC(2026, 0, 1, 0, minute))
const seedCatalog = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const chapter = { mediaId, uploaderId }
  const oneEn = await seedChapter(services, {
    ...chapter,
    number: 1,
    volume: "1",
    title: "Start",
    createdAt: at(1),
  })
  const onePt = await seedChapter(services, {
    ...chapter,
    number: 1,
    language: "pt_br",
    createdAt: at(2),
  })
  const twoEn = await seedChapter(services, { ...chapter, number: 2, createdAt: at(3) })
  const twoPt = await seedChapter(services, {
    ...chapter,
    number: 2,
    language: "pt_br",
    createdAt: at(4),
  })
  const threeEn = await seedChapter(services, { ...chapter, number: 3, createdAt: at(5) })
  const fourPt = await seedChapter(services, {
    ...chapter,
    number: 4,
    language: "pt_br",
    createdAt: at(6),
  })
  const fourEn = await seedChapter(services, { ...chapter, number: 4, createdAt: at(7) })
  const fiveNsfw = await seedChapter(services, {
    ...chapter,
    number: 5,
    contentRating: "NSFW",
    createdAt: at(8),
  })
  const sixDeleted = await seedChapter(services, { ...chapter, number: 6, createdAt: at(9) })

  await services.db
    .updateTable("chapters")
    .set({ deletedAt: new Date(), deleterId: uploaderId })
    .where("id", "=", sixDeleted)
    .execute()

  return {
    mediaId,
    uploaderId,
    oneEn,
    onePt,
    twoEn,
    twoPt,
    threeEn,
    fourPt,
    fourEn,
    fiveNsfw,
    sixDeleted,
  }
}
const getProgress = async (
  app: Parameters<typeof api>[0],
  mediaId: string,
  headers: Record<string, string>,
  query = "",
) => {
  const res = await api<Progress>(app, `/users/me/progress/${mediaId}?${query}`, { headers })

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("GET /users/me/progress/:mediaId", () => {
  test("starts at the first chapter without history", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers } = await signInAs(services)
    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress).toEqual({
      readCount: 0,
      totalCount: 4,
      lastRead: null,
      next: { id: catalog.oneEn, number: 1, volume: "1", title: "Start", language: "en" },
    })
  })

  test("returns the most recently read chapter", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.twoPt, at(20))
    await seedHistory(services, userId, catalog.onePt, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.lastRead).toEqual({
      id: catalog.twoPt,
      number: 2,
      volume: null,
      title: null,
      language: "pt_br",
      readAt: at(20).toISOString(),
    })
    expect(progress.readCount).toBe(2)
  })

  test("counts a number read in several languages once", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.oneEn, at(10))
    await seedHistory(services, userId, catalog.onePt, at(11))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.readCount).toBe(1)
    expect(progress.totalCount).toBe(4)
  })

  test("continues in the language of the last read chapter", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.threeEn, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.next?.id).toBe(catalog.fourEn)
  })

  test("falls back to another language when the next number lacks it", async ({
    app,
    services,
  }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.twoPt, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.next).toEqual({
      id: catalog.threeEn,
      number: 3,
      volume: null,
      title: null,
      language: "en",
    })
  })

  test("skips numbers already read after the last read chapter", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.threeEn, at(10))
    await seedHistory(services, userId, catalog.twoPt, at(20))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.lastRead?.id).toBe(catalog.twoPt)
    expect(progress.next?.id).toBe(catalog.fourPt)
  })

  test("does not go back to unread chapters before the last read one", async ({
    app,
    services,
  }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.fourEn, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress.readCount).toBe(1)
    expect(progress.next).toBeNull()
  })

  test("returns no next chapter once caught up", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.oneEn, at(10))
    await seedHistory(services, userId, catalog.twoEn, at(11))
    await seedHistory(services, userId, catalog.threeEn, at(12))
    await seedHistory(services, userId, catalog.fourPt, at(13))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress).toMatchObject({ readCount: 4, totalCount: 4, next: null })
    expect(progress.lastRead?.id).toBe(catalog.fourPt)
  })

  test("counts only chapters matching the content ratings", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.oneEn, at(10))
    await seedHistory(services, userId, catalog.fiveNsfw, at(20))

    const defaults = await getProgress(app, catalog.mediaId, headers)
    const nsfw = await getProgress(
      app,
      catalog.mediaId,
      headers,
      "contentRating=NORMAL,SUGGESTIVE,NSFW",
    )

    expect(defaults).toMatchObject({ readCount: 1, totalCount: 4 })
    expect(defaults.lastRead?.id).toBe(catalog.oneEn)
    expect(defaults.next?.id).toBe(catalog.twoEn)
    expect(nsfw).toMatchObject({ readCount: 2, totalCount: 5, next: null })
    expect(nsfw.lastRead?.id).toBe(catalog.fiveNsfw)
  })

  test("offers a chapter hidden by default once its rating is requested", async ({
    app,
    services,
  }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.fourEn, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers, "contentRating=NORMAL,NSFW")

    expect(progress.next?.id).toBe(catalog.fiveNsfw)
  })

  test("ignores history of deleted chapters", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const { headers, userId } = await signInAs(services)

    await seedHistory(services, userId, catalog.sixDeleted, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress).toMatchObject({ readCount: 0, totalCount: 4, lastRead: null })
    expect(progress.next?.id).toBe(catalog.oneEn)
  })

  test("ignores history of other medias and other users", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const other = await signInAs(services)
    const { headers, userId } = await signInAs(services)
    const otherMediaId = await seedMedia(services, catalog.uploaderId)
    const otherChapter = await seedChapter(services, {
      mediaId: otherMediaId,
      uploaderId: catalog.uploaderId,
      number: 3,
    })

    await seedHistory(services, userId, otherChapter, at(10))
    await seedHistory(services, other.userId, catalog.threeEn, at(10))

    const progress = await getProgress(app, catalog.mediaId, headers)

    expect(progress).toMatchObject({ readCount: 0, lastRead: null })
    expect(progress.next?.id).toBe(catalog.oneEn)
  })

  test("returns empty progress for a media without chapters", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const progress = await getProgress(app, mediaId, headers)

    expect(progress).toEqual({ readCount: 0, totalCount: 0, lastRead: null, next: null })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/progress/${SEEDED_MEDIA_ID}`)

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test.for(["not-a-uuid", `${SEEDED_MEDIA_ID}?contentRating=SPICY`])(
    "returns VALIDATION_ERROR for %s",
    async (path, { app, services }) => {
      const { headers } = await signInAs(services)
      const res = await api(app, `/users/me/progress/${path}`, { headers })

      expect(res.status).toBe(422)

      if (res.body.success) {
        throw new Error("Expected failure")
      }

      expect(res.body.code).toBe("VALIDATION_ERROR")
    },
  )
})
