import { sql } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type App = Parameters<typeof api>[0]

const makePages = (count: number) => Array.from({ length: count }, () => ({ id: randomUUID() }))
const seedReader = async (services: Services) => {
  const reader = await signInAs(services)
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)

  await services.db.insertInto("userProfiles").values({ userId: reader.userId }).execute()

  return { ...reader, uploaderId, mediaId }
}
const openAgo = async (services: Services, userId: string, chapterId: string, seconds: number) => {
  await services.db
    .insertInto("userHistories")
    .values({
      userId,
      chapterId,
      createdAt: sql<Date>`localtimestamp - make_interval(secs => ${seconds})`,
    })
    .execute()
}
const complete = async (app: App, chapterId: string, headers: Record<string, string>) => {
  const res = await api<{ reward: { pages: number; points: number } | null }>(
    app,
    `/chapters/${chapterId}/history`,
    {
      method: "PATCH",
      headers,
      json: { completed: true },
    },
  )

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data.reward
}
const getPoints = async (services: Services, userId: string) =>
  (
    await services.db
      .selectFrom("userProfiles")
      .select("points")
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()
  ).points

describe("reading rewards", () => {
  test("credits every page of a chapter read at a human pace", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      pages: makePages(45),
    })

    await openAgo(services, userId, chapterId, 600)

    expect(await complete(app, chapterId, headers)).toEqual({ pages: 45, points: 2 })
    expect(await getPoints(services, userId)).toBe(2)
  })

  test("credits only the pages the elapsed time allows", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      pages: makePages(40),
    })

    await openAgo(services, userId, chapterId, 21)

    expect(await complete(app, chapterId, headers)).toEqual({ pages: 10, points: 0 })
  })

  test("credits nothing when completed right after opening", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      pages: makePages(20),
    })

    await openAgo(services, userId, chapterId, 0)

    expect(await complete(app, chapterId, headers)).toBeNull()
    expect(await getPoints(services, userId)).toBe(0)
  })

  test("does not let chapters opened together share the same reading time", async ({
    app,
    services,
  }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const chapters = await Promise.all(
      [1, 2, 3].map((number) =>
        seedChapter(services, { mediaId, uploaderId, number, pages: makePages(20) }),
      ),
    )

    for (const chapterId of chapters) {
      await openAgo(services, userId, chapterId, 600)
    }

    const rewards = []

    for (const chapterId of chapters) {
      rewards.push(await complete(app, chapterId, headers))
    }

    expect(rewards).toEqual([{ pages: 20, points: 1 }, null, null])
    expect(await getPoints(services, userId)).toBe(1)
  })

  test("credits a chapter number once across versions and re-reads", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const english = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      pages: makePages(20),
    })
    const portuguese = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      language: "pt_br",
      pages: makePages(30),
    })

    await openAgo(services, userId, english, 600)

    expect(await complete(app, english, headers)).toEqual({ pages: 20, points: 1 })

    await services.db
      .updateTable("readingRewards")
      .set({ createdAt: sql<Date>`localtimestamp - interval '5 minutes'` })
      .where("userId", "=", userId)
      .execute()
    await openAgo(services, userId, portuguese, 600)

    expect(await complete(app, english, headers)).toBeNull()
    expect(await complete(app, portuguese, headers)).toEqual({ pages: 10, points: 0 })
  })

  test("carries leftover pages over to the next chapter", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const short = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 1,
      pages: makePages(15),
    })
    const next = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 2,
      pages: makePages(6),
    })

    await openAgo(services, userId, short, 600)

    expect(await complete(app, short, headers)).toEqual({ pages: 15, points: 0 })

    await services.db
      .updateTable("readingRewards")
      .set({ createdAt: sql<Date>`localtimestamp - interval '5 minutes'` })
      .where("userId", "=", userId)
      .execute()
    await openAgo(services, userId, next, 600)

    expect(await complete(app, next, headers)).toEqual({ pages: 6, points: 1 })
    expect(await getPoints(services, userId)).toBe(1)
  })

  test("stops crediting once the daily page limit is reached", async ({ app, services }) => {
    const { headers, userId, uploaderId, mediaId } = await seedReader(services)
    const earlier = await seedChapter(services, { mediaId, uploaderId, number: 1 })
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId,
      number: 2,
      pages: makePages(20),
    })

    await services.db
      .insertInto("readingRewards")
      .values({
        userId,
        chapterId: earlier,
        mediaId,
        number: 1,
        pages: 1190,
        points: 59,
        createdAt: sql<Date>`localtimestamp - interval '1 hour'`,
      })
      .execute()
    await openAgo(services, userId, chapterId, 600)

    expect(await complete(app, chapterId, headers)).toEqual({ pages: 10, points: 1 })
  })

  test("never credits the uploader of the chapter", async ({ app, services }) => {
    const { headers, userId, mediaId } = await seedReader(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      pages: makePages(20),
    })

    await openAgo(services, userId, chapterId, 600)

    expect(await complete(app, chapterId, headers)).toBeNull()
  })
})
