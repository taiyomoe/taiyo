import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { api } from "../helpers/request"
import { test } from "../setup"

type ShowcaseRow = {
  id: string
  title: string
  coverUrl: string
  chapterCount: number
  tags: string[]
}

const listShowcase = async (app: Parameters<typeof api>[0]) => {
  const res = await api<ShowcaseRow[]>(app, "/medias/showcase")

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
// Puts every user's library on one all-audience media with a cover, so it
// outranks the rest of the catalog.
const promoteMedia = async (db: Services["db"]) => {
  const media = defined(
    await db
      .selectFrom("medias")
      .innerJoin("covers", "covers.mediaId", "medias.id")
      .where("covers.isMainCover", "=", true)
      .where("covers.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .where("medias.contentRating", "=", "NORMAL")
      .where("medias.flag", "=", "OK")
      .select("medias.id")
      .orderBy("medias.createdAt", "asc")
      .executeTakeFirst(),
  )
  const users = await db.selectFrom("users").select("id").execute()

  await db
    .insertInto("userLibraryEntries")
    .values(users.map((user) => ({ userId: user.id, mediaId: media.id, status: "READING" })))
    .onConflict((oc) => oc.columns(["userId", "mediaId"]).doNothing())
    .execute()

  return media.id
}

describe("GET /medias/showcase", () => {
  test("lists all-audience medias with a cover and a main title", async ({ app, services }) => {
    const data = await listShowcase(app)

    expect(data.length).toBeGreaterThan(0)
    expect(data.length).toBeLessThanOrEqual(16)

    const medias = await services.db
      .selectFrom("medias")
      .where(
        "id",
        "in",
        data.map((media) => media.id),
      )
      .select(["id", "contentRating", "flag", "deletedAt"])
      .execute()

    expect(medias).toHaveLength(data.length)

    for (const media of medias) {
      expect(media).toMatchObject({ contentRating: "NORMAL", flag: "OK", deletedAt: null })
    }

    for (const media of data) {
      expect(media.title).toEqual(expect.any(String))
      expect(media.coverUrl).toContain(`/medias/${media.id}/covers/`)
      expect(media.chapterCount).toBeGreaterThanOrEqual(0)
    }
  })

  test("ranks the most followed medias first", async ({ app, services }) => {
    const mediaId = await promoteMedia(services.db)

    expect(defined((await listShowcase(app))[0]).id).toBe(mediaId)
  })

  test("leaves out medias that are not for all audiences", async ({ app, services }) => {
    const mediaId = await promoteMedia(services.db)

    await services.db
      .updateTable("medias")
      .set({ contentRating: "SUGGESTIVE" })
      .where("id", "=", mediaId)
      .execute()

    expect((await listShowcase(app)).some((media) => media.id === mediaId)).toBe(false)
  })

  test("serves the cached list instead of querying again", async ({ app, services }) => {
    const first = await listShowcase(app)
    const mediaId = defined(first[0]).id

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    expect(await listShowcase(app)).toEqual(first)
  })
})
