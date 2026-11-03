import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { waitForMediaDoc } from "../helpers/wait"
import { test } from "../setup"

type QuickSearch = {
  titles: Array<{ id: string; title: string; coverUrl: string | null; synopsis: object }>
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
