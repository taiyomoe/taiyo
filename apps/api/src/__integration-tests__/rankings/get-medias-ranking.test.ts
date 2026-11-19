import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { creditChapters, DAY_MS, seedReadingTarget } from "./helpers"

type Ranking = {
  total: number
  entries: Array<{
    rank: number
    value: number
    readers: number
    media: { id: string; type: string; status: string; contentRating: string }
  }>
}

const getRanking = async (
  app: Parameters<typeof api>[0],
  query: string,
  headers: Record<string, string>,
) => {
  const res = await api<Ranking>(app, `/rankings/medias${query}`, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("GET /rankings/medias", () => {
  test("ranks visible medias by credited reads this week", async ({ app, services }) => {
    const [popular, quiet, explicit, locked] = await Promise.all([
      seedReadingTarget(services),
      seedReadingTarget(services),
      seedReadingTarget(services, "NSFW"),
      seedReadingTarget(services),
    ])
    const [alice, bob] = await Promise.all([signInAs(services), signInAs(services)])
    const now = new Date()

    await services.db
      .updateTable("medias")
      .set({ flag: "LOCKED" })
      .where("id", "=", locked.mediaId)
      .execute()
    await creditChapters(services, { userId: alice.userId, target: popular, at: now, chapters: 2 })
    await creditChapters(services, { userId: bob.userId, target: popular, at: now })
    await creditChapters(services, { userId: alice.userId, target: quiet, at: now })
    await creditChapters(services, {
      userId: bob.userId,
      target: quiet,
      at: new Date(now.getTime() - 40 * DAY_MS),
      chapters: 9,
    })
    await creditChapters(services, { userId: alice.userId, target: explicit, at: now, chapters: 5 })
    await creditChapters(services, { userId: alice.userId, target: locked, at: now, chapters: 9 })

    const ranking = await getRanking(app, "", alice.headers)

    expect(ranking.total).toBe(2)
    expect(ranking.entries).toMatchObject([
      {
        rank: 1,
        value: 3,
        readers: 2,
        media: {
          id: popular.mediaId,
          title: null,
          coverUrl: null,
          type: "MANGA",
          status: "RELEASING",
          contentRating: "NORMAL",
        },
      },
      { rank: 2, value: 1, readers: 1, media: { id: quiet.mediaId } },
    ])

    const withExplicit = await getRanking(app, "?contentRating=NORMAL,NSFW", alice.headers)

    expect(withExplicit.entries.map((entry) => entry.media.id)).toEqual([
      explicit.mediaId,
      popular.mediaId,
      quiet.mediaId,
    ])

    const allTime = await getRanking(app, "?period=all", alice.headers)

    expect(allTime.entries.map((entry) => entry.media.id)).toEqual([quiet.mediaId, popular.mediaId])
  })

  test("returns VALIDATION_ERROR for an unknown content rating", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/rankings/medias?contentRating=SPICY", { headers })

    expect(res.status).toBe(422)
  })

  test("returns UNAUTHORIZED without a session", async ({ app }) => {
    const res = await api(app, "/rankings/medias")

    expect(res.status).toBe(401)
    expect(!res.body.success && res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns FORBIDDEN for a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/rankings/medias", { headers })

    expect(res.status).toBe(403)
    expect(!res.body.success && res.body.code).toBe("FORBIDDEN")
  })
})
