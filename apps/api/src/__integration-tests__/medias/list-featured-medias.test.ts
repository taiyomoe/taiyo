import { sql } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type FeaturedRow = {
  id: string
  title: string | null
  tags: string[]
  authors: string[]
  coverUrl: string | null
  bannerUrl: string | null
}

const listFeatured = async (app: Parameters<typeof api>[0]) => {
  const res = await api<FeaturedRow[]>(app, "/medias/featured")

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("GET /medias/featured", () => {
  test("returns the seeded featured medias in position order", async ({ app, services }) => {
    const seeded = await services.db
      .selectFrom("featuredMedias")
      .select("mediaId")
      .orderBy("position", "asc")
      .execute()
    const data = await listFeatured(app)

    expect(seeded.length).toBeGreaterThan(0)
    expect(data.map((media) => media.id)).toEqual(seeded.map((row) => row.mediaId))

    for (const media of data) {
      expect(media.title).toEqual(expect.any(String))
      expect(media.coverUrl).toContain(`/medias/${media.id}/covers/`)
    }
  })

  test("follows position changes", async ({ app, services }) => {
    const [first, second] = await listFeatured(app)
    const firstId = defined(first).id

    await services.db
      .updateTable("featuredMedias")
      .set({ position: 1000 })
      .where("mediaId", "=", firstId)
      .execute()

    const data = await listFeatured(app)

    expect(defined(data[0]).id).toBe(defined(second).id)
    expect(defined(data.at(-1)).id).toBe(firstId)
  })

  test("prefers the latest banner when the media has one", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const [first] = await listFeatured(app)
    const mediaId = defined(first).id
    const olderBannerId = randomUUID()
    const newerBannerId = randomUUID()

    await services.db
      .insertInto("banners")
      .values([
        {
          id: olderBannerId,
          mediaId,
          uploaderId: userId,
          createdAt: sql`now() - interval '1 day'`,
        },
        { id: newerBannerId, mediaId, uploaderId: userId },
      ])
      .execute()

    const featured = defined((await listFeatured(app)).find((media) => media.id === mediaId))

    expect(featured.bannerUrl).toContain(`/medias/${mediaId}/banners/${newerBannerId}.jpg`)
  })

  test("omits soft-deleted medias", async ({ app, services }) => {
    const [first] = await listFeatured(app)
    const mediaId = defined(first).id

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    const data = await listFeatured(app)

    expect(data.some((media) => media.id === mediaId)).toBe(false)
  })

  test("returns an empty list when nothing is featured", async ({ app, services }) => {
    await services.db.deleteFrom("featuredMedias").execute()

    expect(await listFeatured(app)).toEqual([])
  })
})
