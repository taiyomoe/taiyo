import { closeRankingPeriods, RANKING_REWARD_POINTS } from "@taiyomoe/queue"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { creditChapters, DAY_MS, seedReadingTarget, setWatermark } from "./helpers"

// A Monday, far enough ahead that the watermark the migration seeded never gets in the way.
const D = new Date("2031-03-03T00:00:00.000Z")
const HOUR_MS = 3_600_000
const days = (count: number) => new Date(D.getTime() + count * DAY_MS)
const watermark = async (
  services: Services,
  { day, week, month }: { day: Date; week: Date; month: Date },
) => {
  await setWatermark(services, "DAY", new Date(day.getTime() - DAY_MS), day)
  await setWatermark(services, "WEEK", new Date(week.getTime() - 7 * DAY_MS), week)
  await setWatermark(
    services,
    "MONTH",
    new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)),
    month,
  )
}
const getResults = ({ db }: Services, startsAt: Date) =>
  db
    .selectFrom("rankingResults")
    .innerJoin("rankingPeriods", "rankingPeriods.id", "rankingResults.periodId")
    .select(["rankingResults.rank", "rankingResults.userId", "rankingResults.points"])
    .where("rankingPeriods.startsAt", "=", startsAt)
    .orderBy("rankingPeriods.kind")
    .orderBy("rankingResults.rank")
    .execute()
const getPoints = async ({ db }: Services, userId: string) => {
  const row = await db
    .selectFrom("userProfiles")
    .select("points")
    .where("userId", "=", userId)
    .executeTakeFirst()

  return row?.points ?? 0
}
const getAchievements = async ({ db }: Services, userId: string) =>
  Object.fromEntries(
    (
      await db
        .selectFrom("userAchievements")
        .select(["key", "count"])
        .where("userId", "=", userId)
        .execute()
    ).map((row) => [row.key, row.count]),
  )
const getNotifications = async ({ db }: Services, userId: string) =>
  db
    .selectFrom("notifications")
    .select(["type", "achievement", "rankingResultId"])
    .where("userId", "=", userId)
    .orderBy("type")
    .orderBy("achievement")
    .execute()

describe("closeRankingPeriods", () => {
  test("pays a closed week once by the points table, even when runs overlap", async ({
    app,
    services,
  }) => {
    const target = await seedReadingTarget(services)
    const readers = await Promise.all(Array.from({ length: 11 }, () => signInAs(services)))

    await watermark(services, { day: days(7), week: D, month: new Date("2031-03-01") })

    for (const [index, reader] of readers.entries()) {
      await creditChapters(services, {
        userId: reader.userId,
        target,
        at: days(1),
        chapters: 20 - index,
      })
    }

    const now = new Date(days(7).getTime() + HOUR_MS)
    const runs = await Promise.all([
      closeRankingPeriods(services, { now }),
      closeRankingPeriods(services, { now }),
    ])

    expect(runs.flat()).toEqual([
      expect.objectContaining({ kind: "WEEK", startsAt: D, endsAt: days(7), results: 10 }),
    ])
    expect(await closeRankingPeriods(services, { now })).toEqual([])

    const results = await getResults(services, D)

    expect(results.map((row) => row.userId)).toEqual(
      readers.slice(0, 10).map((reader) => reader.userId),
    )
    expect(results.map((row) => row.points)).toEqual(RANKING_REWARD_POINTS.WEEK)
    expect(await getPoints(services, readers[0]?.userId ?? "")).toBe(250)
    expect(await getPoints(services, readers[9]?.userId ?? "")).toBe(50)
    expect(await getPoints(services, readers[10]?.userId ?? "")).toBe(0)
    expect(await getAchievements(services, readers[0]?.userId ?? "")).toEqual({
      topTen: 1,
      weeklyPodium: 1,
      weeklyChampion: 1,
    })
    expect(await getAchievements(services, readers[5]?.userId ?? "")).toEqual({ topTen: 1 })
    expect(await getAchievements(services, readers[10]?.userId ?? "")).toEqual({})
    expect(await getNotifications(services, readers[3]?.userId ?? "")).toEqual([
      expect.objectContaining({ type: "RANKING_REWARD" }),
      { type: "ACHIEVEMENT_EARNED", achievement: "topTen", rankingResultId: null },
    ])
    expect(await getNotifications(services, readers[10]?.userId ?? "")).toEqual([])

    const first = readers[0]

    if (first === undefined) {
      throw new Error("Expected a reader")
    }

    const listed = await api<Array<{ type: string; ranking?: unknown; achievement?: unknown }>>(
      app,
      "/users/me/notifications?category=rewards",
      { headers: first.headers },
    )

    if (!listed.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(listed.body)}`)
    }

    expect(listed.body.data).toHaveLength(4)
    expect(listed.body.data).toContainEqual(
      expect.objectContaining({
        type: "RANKING_REWARD",
        ranking: {
          period: "WEEK",
          startsAt: D.toISOString(),
          endsAt: days(7).toISOString(),
          rank: 1,
          chapters: 20,
          points: 250,
        },
      }),
    )
    expect(listed.body.data).toContainEqual(
      expect.objectContaining({
        type: "ACHIEVEMENT_EARNED",
        achievement: { key: "weeklyChampion", category: "ranking", rarity: "epic", points: 0 },
      }),
    )

    const counts = await api<{ categories: { rewards: number } }>(
      app,
      "/users/me/notifications/counts",
      { headers: first.headers },
    )

    expect(counts.body.success && counts.body.data.categories.rewards).toBe(4)
  })

  test("pays a closed month by the points table", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const first = await signInAs(services)
    const second = await signInAs(services)
    const april = new Date("2031-04-01T00:00:00.000Z")

    await watermark(services, {
      day: april,
      week: new Date("2031-03-31"),
      month: new Date("2031-03-01"),
    })
    await creditChapters(services, { userId: first.userId, target, at: days(10), chapters: 3 })
    await creditChapters(services, { userId: second.userId, target, at: days(20), chapters: 2 })

    const closed = await closeRankingPeriods(services, {
      now: new Date(april.getTime() + HOUR_MS),
    })

    expect(closed.map(({ kind, startsAt }) => ({ kind, startsAt }))).toEqual([
      { kind: "MONTH", startsAt: new Date("2031-03-01T00:00:00.000Z") },
    ])
    expect(await getPoints(services, first.userId)).toBe(RANKING_REWARD_POINTS.MONTH[0])
    expect(await getPoints(services, second.userId)).toBe(RANKING_REWARD_POINTS.MONTH[1])
    expect(await getAchievements(services, first.userId)).toEqual({
      topTen: 1,
      monthlyPodium: 1,
      monthlyChampion: 1,
    })
    expect(await getAchievements(services, second.userId)).toEqual({
      topTen: 1,
      monthlyPodium: 1,
    })
  })

  test("catches up missed days oldest first, without points", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const alice = await signInAs(services)
    const bob = await signInAs(services)

    await watermark(services, { day: D, week: D, month: new Date("2031-03-01") })
    await creditChapters(services, { userId: alice.userId, target, at: days(0), chapters: 2 })
    await creditChapters(services, { userId: bob.userId, target, at: days(0) })
    await creditChapters(services, { userId: bob.userId, target, at: days(1), chapters: 2 })
    await creditChapters(services, { userId: alice.userId, target, at: days(2), chapters: 2 })

    const closed = await closeRankingPeriods(services, {
      now: new Date(days(3).getTime() + HOUR_MS),
    })

    expect(closed.map(({ kind, startsAt }) => ({ kind, startsAt }))).toEqual([
      { kind: "DAY", startsAt: days(0) },
      { kind: "DAY", startsAt: days(1) },
      { kind: "DAY", startsAt: days(2) },
    ])
    expect(await getResults(services, days(0))).toEqual([
      { rank: 1, userId: alice.userId, points: 0 },
      { rank: 2, userId: bob.userId, points: 0 },
    ])
    expect((await getResults(services, days(1)))[0]?.userId).toBe(bob.userId)
    expect((await getResults(services, days(2)))[0]?.userId).toBe(alice.userId)
    expect(await getPoints(services, alice.userId)).toBe(0)
    expect(await getAchievements(services, alice.userId)).toEqual({ dailyChampion: 2 })
    // Only the first daily win notifies.
    expect(await getNotifications(services, alice.userId)).toEqual([
      { type: "ACHIEVEMENT_EARNED", achievement: "dailyChampion", rankingResultId: null },
    ])
  })

  test("breaks ties by pages, then by whoever got there first", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const [early, late, heavy] = await Promise.all([
      signInAs(services),
      signInAs(services),
      signInAs(services),
    ])

    await watermark(services, { day: D, week: D, month: new Date("2031-03-01") })
    await creditChapters(services, {
      userId: late.userId,
      target,
      at: new Date(D.getTime() + 2 * HOUR_MS),
    })
    await creditChapters(services, {
      userId: early.userId,
      target,
      at: new Date(D.getTime() + HOUR_MS),
    })
    await creditChapters(services, {
      userId: heavy.userId,
      target,
      at: new Date(D.getTime() + 3 * HOUR_MS),
      pages: 40,
    })
    await closeRankingPeriods(services, { now: new Date(days(1).getTime() + HOUR_MS) })

    expect((await getResults(services, D)).map((row) => row.userId)).toEqual([
      heavy.userId,
      early.userId,
      late.userId,
    ])
  })

  test("only closes periods after the watermark", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const before = await signInAs(services)
    const after = await signInAs(services)

    await watermark(services, { day: D, week: D, month: new Date("2031-03-01") })
    await creditChapters(services, { userId: before.userId, target, at: days(-1), chapters: 5 })
    await creditChapters(services, { userId: after.userId, target, at: days(0) })

    const closed = await closeRankingPeriods(services, {
      now: new Date(days(1).getTime() + HOUR_MS),
    })

    expect(closed.map(({ startsAt }) => startsAt)).toEqual([days(0)])
    expect(await getResults(services, days(-1))).toEqual([])
    expect(await getAchievements(services, before.userId)).toEqual({})
  })

  test("leaves banned readers out", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const banned = await signInAs(services, { banned: true })
    const reader = await signInAs(services)

    await watermark(services, { day: D, week: D, month: new Date("2031-03-01") })
    await creditChapters(services, { userId: banned.userId, target, at: days(0), chapters: 10 })
    await creditChapters(services, { userId: reader.userId, target, at: days(0) })
    await closeRankingPeriods(services, { now: new Date(days(1).getTime() + HOUR_MS) })

    expect(await getResults(services, days(0))).toEqual([
      { rank: 1, userId: reader.userId, points: 0 },
    ])
    expect(await getAchievements(services, banned.userId)).toEqual({})
  })

  test("awards the 3, 7 and 30 day streaks once each", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const champion = await signInAs(services)
    const runnerUp = await signInAs(services)

    await watermark(services, { day: D, week: days(28), month: new Date("2031-04-01") })

    for (let day = 0; day < 30; day++) {
      await creditChapters(services, {
        userId: champion.userId,
        target,
        at: days(day),
        chapters: 2,
      })
      await creditChapters(services, { userId: runnerUp.userId, target, at: days(day) })
    }

    const closed = await closeRankingPeriods(services, {
      now: new Date(days(30).getTime() + HOUR_MS),
    })

    expect(closed).toHaveLength(30)

    // Daily totals go a week after their day closed; weekly and monthly ones stay.
    const kept = await services.db
      .selectFrom("readerTotals")
      .select(["kind", "startsAt"])
      .where("userId", "=", champion.userId)
      .where("kind", "!=", "ALL")
      .execute()

    expect(kept.filter(({ kind }) => kind === "DAY").map(({ startsAt }) => startsAt)).toEqual(
      Array.from({ length: 8 }, (_, index) => days(22 + index)),
    )
    expect(kept.filter(({ kind }) => kind === "MONTH")).toHaveLength(2)
    expect(kept.filter(({ kind }) => kind === "WEEK")).toHaveLength(5)
    expect(await getAchievements(services, champion.userId)).toEqual({
      dailyChampion: 30,
      hatTrick: 1,
      unstoppable: 1,
      sovereign: 1,
    })
    expect(await getPoints(services, champion.userId)).toBe(100 + 300 + 1500)
    expect(await getNotifications(services, champion.userId)).toEqual(
      ["dailyChampion", "hatTrick", "sovereign", "unstoppable"].map((achievement) => ({
        type: "ACHIEVEMENT_EARNED",
        achievement,
        rankingResultId: null,
      })),
    )
    expect(await getAchievements(services, runnerUp.userId)).toEqual({})
  })

  test("starts a streak over once another reader wins a day", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const alice = await signInAs(services)
    const bob = await signInAs(services)
    const win = (userId: string, day: number) =>
      creditChapters(services, { userId, target, at: days(day), chapters: 2 })

    await watermark(services, { day: D, week: D, month: new Date("2031-03-01") })
    await win(alice.userId, 0)
    await win(alice.userId, 1)
    await win(bob.userId, 2)
    await win(alice.userId, 3)
    await win(alice.userId, 4)
    await closeRankingPeriods(services, { now: new Date(days(5).getTime() + HOUR_MS) })

    expect(await getAchievements(services, alice.userId)).toEqual({ dailyChampion: 4 })

    await win(alice.userId, 5)
    await closeRankingPeriods(services, { now: new Date(days(6).getTime() + HOUR_MS) })

    expect(await getAchievements(services, alice.userId)).toEqual({
      dailyChampion: 5,
      hatTrick: 1,
    })
  })

  test("only sets a watermark for a kind never closed", async ({ services }) => {
    await services.db.deleteFrom("rankingPeriods").execute()

    expect(await closeRankingPeriods(services, { now: new Date(D.getTime() + HOUR_MS) })).toEqual(
      [],
    )

    const periods = await services.db
      .selectFrom("rankingPeriods")
      .select(["kind", "startsAt", "endsAt"])
      .orderBy("kind")
      .execute()

    expect(periods).toEqual([
      { kind: "DAY", startsAt: days(-1), endsAt: D },
      { kind: "WEEK", startsAt: days(-7), endsAt: D },
      {
        kind: "MONTH",
        startsAt: new Date("2031-02-01T00:00:00.000Z"),
        endsAt: new Date("2031-03-01T00:00:00.000Z"),
      },
    ])
  })
})
