import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

type QuickSearch = {
  titles: Array<{
    id: string
    title: string
    matchedTitle: string | null
    coverUrl: string | null
    synopsis: object
  }>
  groups: Array<{ id: string; name: string; description: string | null; logoUrl: string | null }>
  users: Array<{ id: string; username: string; displayUsername: string }>
}

const quickSearch = async (app: Parameters<typeof api>[0], query: string) => {
  const res = await api<QuickSearch>(app, `/search?${query}`)

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
const sharesWord = (a: string, b: string) => {
  const other = new Set(words(b))

  return words(a).some((word) => other.has(word))
}
const sharesWordWithSibling = (
  row: { id: string; alt: string },
  rows: ReadonlyArray<{ id: string; alt: string }>,
) =>
  rows.some(
    (other) => other.id === row.id && other.alt !== row.alt && sharesWord(row.alt, other.alt),
  )
const indexedNormalMedia = async (services: Services) => {
  const media = defined(
    await services.db
      .selectFrom("medias")
      .innerJoin("titles", "titles.mediaId", "medias.id")
      .innerJoin("covers", "covers.mediaId", "medias.id")
      .select(["medias.id", "titles.title"])
      .where("medias.deletedAt", "is", null)
      .where("medias.contentRating", "=", "NORMAL")
      .where("titles.isMainTitle", "=", true)
      .where("titles.deletedAt", "is", null)
      .where("covers.isMainCover", "=", true)
      .where("covers.deletedAt", "is", null)
      .limit(1)
      .executeTakeFirst(),
  )

  await waitForMediaDoc(services, media.id, (doc) => doc !== null)

  return media
}

describe("GET /search", () => {
  test("finds a title by its main title, with its cover and synopsis", async ({
    app,
    services,
  }) => {
    const media = await indexedNormalMedia(services)
    const data = await quickSearch(app, `q=${encodeURIComponent(media.title)}&limit=10`)
    const hit = defined(data.titles.find((title) => title.id === media.id))

    expect(hit.title).toBe(media.title)
    expect(hit.coverUrl).toContain(`/medias/${media.id}/covers/`)
    expect(hit.synopsis).toEqual(expect.any(Object))
  })

  test("reports no matched title when the query matches the main title", async ({
    app,
    services,
  }) => {
    const media = await indexedNormalMedia(services)
    const data = await quickSearch(app, `q=${encodeURIComponent(media.title)}&limit=10`)

    expect(defined(data.titles.find((title) => title.id === media.id)).matchedTitle).toBeNull()
  })

  test("reports the alternative title the query matched", async ({ app, services }) => {
    const rows = await services.db
      .selectFrom("titles as alt")
      .innerJoin("titles as main", "main.mediaId", "alt.mediaId")
      .innerJoin("medias", "medias.id", "alt.mediaId")
      .innerJoin("covers", "covers.mediaId", "medias.id")
      .select(["medias.id", "alt.title as alt", "main.title as main"])
      .where("medias.deletedAt", "is", null)
      .where("medias.contentRating", "=", "NORMAL")
      .where("main.isMainTitle", "=", true)
      .where("main.deletedAt", "is", null)
      .where("alt.isMainTitle", "=", false)
      .where("alt.deletedAt", "is", null)
      .where("covers.isMainCover", "=", true)
      .where("covers.deletedAt", "is", null)
      .orderBy("medias.id")
      .orderBy("alt.title")
      .execute()
    const media = defined(
      rows.find(
        (row) =>
          words(row.alt).length >= 2 &&
          !sharesWord(row.alt, row.main) &&
          !sharesWordWithSibling(row, rows),
      ),
    )

    await waitForMediaDoc(services, media.id, (doc) => doc !== null)

    const data = await quickSearch(app, `q=${encodeURIComponent(media.alt)}&limit=10`)

    expect(defined(data.titles.find((title) => title.id === media.id)).matchedTitle).toBe(media.alt)
  })

  test("leaves out titles whose content rating was not asked for", async ({ app, services }) => {
    const media = await indexedNormalMedia(services)
    const data = await quickSearch(
      app,
      `q=${encodeURIComponent(media.title)}&limit=10&contentRating=NSFW`,
    )

    expect(data.titles.some((title) => title.id === media.id)).toBe(false)
  })

  test("ranks an exact group name before partial matches", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const exactId = await seedGroup(services, userId, "Quicksilver")
    const partialId = await seedGroup(services, userId, "Another Quicksilver Team")

    await services.db
      .updateTable("groups")
      .set({ description: "Fast scans", logo: "groups/quicksilver/logo.png" })
      .where("id", "=", exactId)
      .execute()

    const data = await quickSearch(app, "q=quicksilver")
    const ids = data.groups.map((group) => group.id)

    expect(ids.indexOf(exactId)).toBe(0)
    expect(ids).toContain(partialId)
    expect(data.groups[0]?.description).toBe("Fast scans")
    expect(data.groups[0]?.logoUrl).toMatch(/\/groups\/quicksilver\/logo\.png$/)
  })

  test("finds users by username but never banned ones", async ({ app, services }) => {
    const visible = await signInAs(services)
    const banned = await signInAs(services, { banned: true })
    const [visibleUser, bannedUser] = await Promise.all(
      [visible.userId, banned.userId].map((id) =>
        services.db
          .selectFrom("users")
          .select("username")
          .where("id", "=", id)
          .executeTakeFirstOrThrow(),
      ),
    )
    const found = await quickSearch(app, `q=${defined(visibleUser).username}`)
    const hidden = await quickSearch(app, `q=${defined(bannedUser).username}`)

    expect(found.users.map((user) => user.id)).toEqual([visible.userId])
    expect(hidden.users).toEqual([])
  })

  test("rejects an empty query", async ({ app }) => {
    const res = await api(app, "/search?q=")

    expect(res.status).toBe(422)
  })
})
