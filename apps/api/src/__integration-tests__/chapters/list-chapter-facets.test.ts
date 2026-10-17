import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type Facets = {
  total: number
  volumes: Array<{ volume: string | null; count: number; firstNumber: number; lastNumber: number }>
  languages: Array<{ language: string; count: number }>
}

const seedCatalog = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const chapter = { mediaId, uploaderId }

  await seedChapter(services, { ...chapter, number: 1, volume: "1" })
  await seedChapter(services, { ...chapter, number: 1, language: "pt_br", volume: "1" })
  await seedChapter(services, { ...chapter, number: 2, volume: "1" })
  await seedChapter(services, { ...chapter, number: 3, language: "pt_br", volume: "1" })
  await seedChapter(services, { ...chapter, number: 10, volume: "2" })
  await seedChapter(services, { ...chapter, number: 11 })
  await seedChapter(services, { ...chapter, number: 12, contentRating: "NSFW" })

  const deleted = await seedChapter(services, { ...chapter, number: 13, volume: "3" })

  await services.db
    .updateTable("chapters")
    .set({ deletedAt: new Date(), deleterId: uploaderId })
    .where("id", "=", deleted)
    .execute()

  return { mediaId, uploaderId }
}
const getFacets = async (app: Parameters<typeof api>[0], mediaId: string, query = "") => {
  const res = await api<Facets>(app, `/medias/${mediaId}/chapters/facets?${query}`)

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("GET /medias/:id/chapters/facets", () => {
  test("summarises the chapters by volume and language", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const facets = await getFacets(app, catalog.mediaId)

    expect(facets).toEqual({
      total: 6,
      volumes: [
        { volume: null, count: 1, firstNumber: 11, lastNumber: 11 },
        { volume: "2", count: 1, firstNumber: 10, lastNumber: 10 },
        { volume: "1", count: 4, firstNumber: 1, lastNumber: 3 },
      ],
      languages: [
        { language: "en", count: 4 },
        { language: "pt_br", count: 2 },
      ],
    })
  })

  test("returns empty facets for a media without chapters", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const facets = await getFacets(app, mediaId)

    expect(facets).toEqual({ total: 0, volumes: [], languages: [] })
  })

  test("narrows the total and volumes but not languages by language", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const portuguese = await getFacets(app, catalog.mediaId, "language=pt_br")
    const english = await getFacets(app, catalog.mediaId, "language=en")
    const languages = [
      { language: "en", count: 4 },
      { language: "pt_br", count: 2 },
    ]

    expect(portuguese).toEqual({
      total: 2,
      volumes: [{ volume: "1", count: 2, firstNumber: 1, lastNumber: 3 }],
      languages,
    })
    expect(english).toEqual({
      total: 4,
      volumes: [
        { volume: null, count: 1, firstNumber: 11, lastNumber: 11 },
        { volume: "2", count: 1, firstNumber: 10, lastNumber: 10 },
        { volume: "1", count: 2, firstNumber: 1, lastNumber: 2 },
      ],
      languages,
    })
  })

  test("returns no volumes for a language without chapters", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const facets = await getFacets(app, catalog.mediaId, "language=ja")

    expect(facets.total).toBe(0)
    expect(facets.volumes).toEqual([])
    expect(facets.languages).toHaveLength(2)
  })

  test("counts only chapters matching the content ratings", async ({ app, services }) => {
    const catalog = await seedCatalog(services)
    const nsfw = await getFacets(app, catalog.mediaId, "contentRating=NSFW")
    const all = await getFacets(app, catalog.mediaId, "contentRating=NORMAL,SUGGESTIVE,NSFW")

    expect(nsfw).toEqual({
      total: 1,
      volumes: [{ volume: null, count: 1, firstNumber: 12, lastNumber: 12 }],
      languages: [{ language: "en", count: 1 }],
    })
    expect(all.total).toBe(7)
    expect(all.volumes[0]).toEqual({ volume: null, count: 2, firstNumber: 11, lastNumber: 12 })
  })

  test("rates a chapter as the stricter of itself and its media", async ({ app, services }) => {
    const catalog = await seedCatalog(services)

    await services.db
      .updateTable("medias")
      .set({ contentRating: "NSFW" })
      .where("id", "=", catalog.mediaId)
      .execute()

    const defaults = await getFacets(app, catalog.mediaId)
    const nsfw = await getFacets(app, catalog.mediaId, "contentRating=NSFW")

    expect(defaults).toEqual({ total: 0, volumes: [], languages: [] })
    expect(nsfw.total).toBe(7)
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/chapters/facets`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid/chapters/facets`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test.for(["language=xx", "contentRating=SPICY", "contentRating="])(
    "returns VALIDATION_ERROR for %s",
    async (query, { app }) => {
      const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters/facets?${query}`)

      expect(res.status).toBe(422)

      if (res.body.success) {
        throw new Error("Expected failure")
      }

      expect(res.body.code).toBe("VALIDATION_ERROR")
    },
  )
})
