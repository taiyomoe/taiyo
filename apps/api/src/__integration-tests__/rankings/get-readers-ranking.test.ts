import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { creditChapters, DAY_MS, seedReadingTarget } from "./helpers"

type Entry = {
  rank: number
  value: number
  pages: number
  user: { id: string; title: string | null; level: number }
}
type Ranking = {
  period: string
  startsAt: string | null
  total: number
  entries: Entry[]
  me: {
    rank: number
    value: number
    pages: number
    above: { user: { id: string }; value: number; gap: number } | null
  } | null
}

const getRanking = async (
  app: Parameters<typeof api>[0],
  query: string,
  headers: Record<string, string>,
) => {
  const res = await api<Ranking>(app, `/rankings/readers${query}`, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
// Three readers this week, a banned one with more chapters, and an old read outside the week.
const seedReaders = async (services: Services) => {
  const target = await seedReadingTarget(services)
  const [first, second, third, banned] = await Promise.all([
    signInAs(services),
    signInAs(services),
    signInAs(services),
    signInAs(services, { banned: true }),
  ])
  const now = new Date()

  await services.db
    .insertInto("userProfiles")
    .values({ userId: first.userId, title: "bookworm" })
    .execute()
  await creditChapters(services, { userId: first.userId, target, at: now, chapters: 3 })
  await creditChapters(services, { userId: second.userId, target, at: now, chapters: 2, pages: 30 })
  await creditChapters(services, { userId: third.userId, target, at: now, chapters: 2 })
  await creditChapters(services, { userId: banned.userId, target, at: now, chapters: 9 })
  await creditChapters(services, {
    userId: third.userId,
    target,
    at: new Date(now.getTime() - 40 * DAY_MS),
    chapters: 2,
    pages: 300,
  })

  return { first, second, third }
}

describe("GET /rankings/readers", () => {
  test("ranks this week's readers, leaving banned users out", async ({ app, services }) => {
    const { first, second, third } = await seedReaders(services)
    const viewer = await signInAs(services)
    const ranking = await getRanking(app, "", viewer.headers)

    expect(ranking).toMatchObject({ period: "week", total: 3, me: null })
    expect(new Date(ranking.startsAt ?? "").getUTCDay()).toBe(1)
    expect(
      ranking.entries.map(({ rank, value, pages, user }) => [rank, value, pages, user.id]),
    ).toEqual([
      [1, 3, 60, first.userId],
      [2, 2, 60, second.userId],
      [3, 2, 40, third.userId],
    ])
    expect(ranking.entries[0]?.user).toMatchObject({ title: "bookworm", level: 1 })
    // Level counts every credited page, not only the week's.
    expect(ranking.entries[2]?.user.level).toBeGreaterThan(1)
  })

  test("ranks every credited chapter for all time", async ({ app, services }) => {
    const { first, third } = await seedReaders(services)
    const ranking = await getRanking(app, "?period=all", first.headers)

    expect(ranking).toMatchObject({ period: "all", startsAt: null, total: 3 })
    expect(ranking.entries.map(({ user }) => user.id).slice(0, 2)).toEqual([
      third.userId,
      first.userId,
    ])
  })

  test("returns your rank and the gap to the reader above you", async ({ app, services }) => {
    const { first, second, third } = await seedReaders(services)
    const outsider = await signInAs(services)

    expect((await getRanking(app, "", third.headers)).me).toMatchObject({
      rank: 3,
      value: 2,
      pages: 40,
      level: 3,
      above: { user: { id: second.userId }, value: 2, gap: 1 },
    })
    expect((await getRanking(app, "", second.headers)).me).toMatchObject({
      rank: 2,
      above: { user: { id: first.userId }, value: 3, gap: 2 },
    })
    expect((await getRanking(app, "", first.headers)).me).toMatchObject({ rank: 1, above: null })
    expect((await getRanking(app, "", outsider.headers)).me).toBeNull()
  })

  test("keeps your own rank live while the ranking is cached", async ({ app, services }) => {
    const { third } = await seedReaders(services)
    const target = await seedReadingTarget(services)

    await getRanking(app, "", third.headers)
    await creditChapters(services, { userId: third.userId, target, at: new Date(), chapters: 5 })

    const ranking = await getRanking(app, "", third.headers)

    expect(ranking.entries[0]?.user.id).not.toBe(third.userId)
    expect(ranking.me).toMatchObject({ rank: 1, value: 7, above: null })
  })

  test("ranks the first reader of a period at once, never caching an empty ranking", async ({
    app,
    services,
  }) => {
    const reader = await signInAs(services)
    const target = await seedReadingTarget(services)

    expect((await getRanking(app, "", reader.headers)).entries).toEqual([])

    await creditChapters(services, { userId: reader.userId, target, at: new Date() })

    const ranking = await getRanking(app, "", reader.headers)

    expect(ranking.entries.map((entry) => entry.user.id)).toEqual([reader.userId])
    expect(ranking.me).toMatchObject({ rank: 1, above: null })
  })

  test("returns VALIDATION_ERROR for an unknown period", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/rankings/readers?period=year", { headers })

    expect(res.status).toBe(422)
    expect(!res.body.success && res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns UNAUTHORIZED without a session", async ({ app }) => {
    const res = await api(app, "/rankings/readers")

    expect(res.status).toBe(401)
    expect(!res.body.success && res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns FORBIDDEN for a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/rankings/readers", { headers })

    expect(res.status).toBe(403)
    expect(!res.body.success && res.body.code).toBe("FORBIDDEN")
  })
})
