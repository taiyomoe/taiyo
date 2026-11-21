import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"
import { creditChapters, DAY_MS, seedReadingTarget } from "./helpers"

// A Wednesday: its day, week (from Monday 2031-03-03) and month (from 2031-03-01) differ.
const AT = new Date("2031-03-05T12:00:00.000Z")
const getTotals = ({ db }: Services, userId: string) =>
  db
    .selectFrom("readerTotals")
    .select(["kind", "startsAt", "chapters", "pages", "lastAt"])
    .where("userId", "=", userId)
    .orderBy("kind")
    .orderBy("startsAt")
    .execute()

describe("readerTotals", () => {
  test("adds every credited chapter to its day, week, month and all time", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const { userId } = await signInAs(services)
    const later = new Date(AT.getTime() + DAY_MS)

    await creditChapters(services, { userId, target, at: AT, chapters: 2, pages: 10 })
    await creditChapters(services, { userId, target, at: later, pages: 5 })

    expect(await getTotals(services, userId)).toEqual([
      { kind: "DAY", startsAt: new Date("2031-03-05"), chapters: 2, pages: 20, lastAt: AT },
      { kind: "DAY", startsAt: new Date("2031-03-06"), chapters: 1, pages: 5, lastAt: later },
      { kind: "WEEK", startsAt: new Date("2031-03-03"), chapters: 3, pages: 25, lastAt: later },
      { kind: "MONTH", startsAt: new Date("2031-03-01"), chapters: 3, pages: 25, lastAt: later },
      { kind: "ALL", startsAt: new Date(0), chapters: 3, pages: 25, lastAt: later },
    ])
  })

  test("recounts the totals when credited chapters change or go", async ({ services }) => {
    const target = await seedReadingTarget(services)
    const { userId } = await signInAs(services)
    const later = new Date(AT.getTime() + DAY_MS)

    await creditChapters(services, { userId, target, at: AT, pages: 10 })
    await creditChapters(services, { userId, target, at: later, pages: 5 })
    await services.db
      .updateTable("readingRewards")
      .set({ pages: 7 })
      .where("userId", "=", userId)
      .where("createdAt", "=", AT)
      .execute()
    await services.db
      .deleteFrom("readingRewards")
      .where("userId", "=", userId)
      .where("createdAt", "=", later)
      .execute()

    expect(await getTotals(services, userId)).toEqual([
      { kind: "DAY", startsAt: new Date("2031-03-05"), chapters: 1, pages: 7, lastAt: AT },
      { kind: "WEEK", startsAt: new Date("2031-03-03"), chapters: 1, pages: 7, lastAt: AT },
      { kind: "MONTH", startsAt: new Date("2031-03-01"), chapters: 1, pages: 7, lastAt: AT },
      { kind: "ALL", startsAt: new Date(0), chapters: 1, pages: 7, lastAt: AT },
    ])

    // A chapter going away takes its credits, and the totals, with it.
    await services.db.deleteFrom("chapters").where("id", "=", target.chapterId).execute()

    expect(await getTotals(services, userId)).toEqual([])
  })

  test("counts a chapter credited over several reads once per period", async ({ services }) => {
    const { chapterId, mediaId } = await seedReadingTarget(services)
    const { userId } = await signInAs(services)
    const later = new Date(AT.getTime() + DAY_MS)
    const credit = (pages: number, createdAt: Date) =>
      services.db
        .insertInto("readingRewards")
        .values({ userId, chapterId, mediaId, number: 1, pages, points: 0, createdAt })
        .execute()

    await credit(3, AT)
    await credit(4, new Date(AT.getTime() + 60_000))
    await credit(2, later)

    expect(await getTotals(services, userId)).toEqual([
      {
        kind: "DAY",
        startsAt: new Date("2031-03-05"),
        chapters: 1,
        pages: 7,
        lastAt: new Date(AT.getTime() + 60_000),
      },
      { kind: "DAY", startsAt: new Date("2031-03-06"), chapters: 1, pages: 2, lastAt: later },
      { kind: "WEEK", startsAt: new Date("2031-03-03"), chapters: 1, pages: 9, lastAt: later },
      { kind: "MONTH", startsAt: new Date("2031-03-01"), chapters: 1, pages: 9, lastAt: later },
      { kind: "ALL", startsAt: new Date(0), chapters: 1, pages: 9, lastAt: later },
    ])

    await services.db
      .deleteFrom("readingRewards")
      .where("userId", "=", userId)
      .where("createdAt", "=", AT)
      .execute()

    expect(
      (await getTotals(services, userId)).map(({ chapters, pages }) => ({ chapters, pages })),
    ).toEqual([
      { chapters: 1, pages: 4 },
      { chapters: 1, pages: 2 },
      { chapters: 1, pages: 6 },
      { chapters: 1, pages: 6 },
      { chapters: 1, pages: 6 },
    ])
  })
})
