import { sql } from "@taiyomoe/db"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type History = {
  hidden: boolean
  entries: Array<{
    day: string
    media: { id: string }
    chapters: number
    firstNumber: number
    lastNumber: number
  }>
}

const read = async (
  { db }: Services,
  userId: string,
  chapterId: string,
  at: string,
  { markedOnly = false }: { markedOnly?: boolean } = {},
) => {
  await db
    .insertInto("userHistories")
    .values({
      userId,
      chapterId,
      completed: true,
      pageId: markedOnly ? null : crypto.randomUUID(),
      createdAt: sql<Date>`${at}::timestamp`,
      updatedAt: sql<Date>`${at}::timestamp`,
    })
    .execute()
}
const seedReads = async (services: Services) => {
  const reader = await signInAs(services)
  const uploader = await signInAs(services)
  const first = await seedMedia(services, uploader.userId)
  const second = await seedMedia(services, uploader.userId)
  const chapter = (mediaId: string, number: number) =>
    seedChapter(services, { mediaId, uploaderId: uploader.userId, number })

  return { reader, first, second, chapter }
}

describe("GET /users/:id/reading-history", () => {
  test("groups the chapters of a title read on the same day", async ({ app, services }) => {
    const { reader, first, second, chapter } = await seedReads(services)

    for (const [number, at] of [
      [1, "2026-05-10 10:00:00"],
      [2, "2026-05-10 10:05:00"],
      [3, "2026-05-10 10:10:00"],
      [4, "2026-05-11 12:00:00"],
    ] as const) {
      await read(services, reader.userId, await chapter(first, number), at)
    }

    await read(services, reader.userId, await chapter(second, 7), "2026-05-11 09:00:00")

    const res = await api<History>(
      app,
      `/users/${reader.userId}/reading-history?timeZone=UTC&contentRating=NORMAL`,
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.hidden).toBe(false)
    expect(
      res.body.data.entries.map(({ day, media, chapters, firstNumber, lastNumber }) => ({
        day,
        media: media.id,
        chapters,
        firstNumber,
        lastNumber,
      })),
    ).toEqual([
      { day: "2026-05-11", media: first, chapters: 1, firstNumber: 4, lastNumber: 4 },
      { day: "2026-05-11", media: second, chapters: 1, firstNumber: 7, lastNumber: 7 },
      { day: "2026-05-10", media: first, chapters: 3, firstNumber: 1, lastNumber: 3 },
    ])
  })

  test("cuts days in the requested time zone", async ({ app, services }) => {
    const { reader, first, chapter } = await seedReads(services)

    await read(services, reader.userId, await chapter(first, 1), "2026-05-10 23:30:00")

    const res = await api<History>(
      app,
      `/users/${reader.userId}/reading-history?timeZone=Asia/Tokyo&contentRating=NORMAL`,
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.entries[0]?.day).toBe("2026-05-11")
  })

  test("leaves out chapters only marked as read", async ({ app, services }) => {
    const { reader, first, chapter } = await seedReads(services)

    await read(services, reader.userId, await chapter(first, 1), "2026-05-10 10:00:00", {
      markedOnly: true,
    })

    const res = await api<History>(app, `/users/${reader.userId}/reading-history?timeZone=UTC`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.entries).toEqual([])
  })

  test("hides the history of a private library from others only", async ({ app, services }) => {
    const { reader, first, chapter } = await seedReads(services)
    const visitor = await signInAs(services)

    await read(services, reader.userId, await chapter(first, 1), "2026-05-10 10:00:00")
    await services.db
      .updateTable("users")
      .set({ settings: { showLibrary: false } })
      .where("id", "=", reader.userId)
      .execute()

    const hidden = await api<History>(app, `/users/${reader.userId}/reading-history`, {
      headers: visitor.headers,
    })
    const own = await api<History>(app, `/users/${reader.userId}/reading-history`, {
      headers: reader.headers,
    })

    if (!hidden.body.success || !own.body.success) {
      throw new Error("Expected success")
    }

    expect(hidden.body.data).toEqual({ hidden: true, entries: [] })
    expect(own.body.data.entries).toHaveLength(1)
  })

  test("rejects an unknown time zone", async ({ app, services }) => {
    const { reader } = await seedReads(services)
    const res = await api(app, `/users/${reader.userId}/reading-history?timeZone=Mars/Olympus`)

    expect(res.status).toBe(422)
  })
})

describe("reading stats", () => {
  test("counts titles read per genre tag only", async ({ app, services }) => {
    const { reader, first, chapter } = await seedReads(services)

    await services.db
      .updateTable("medias")
      .set({
        tags: sql`array['{"key":"ACTION","isSpoiler":false}'::jsonb, '{"key":"SCHOOL","isSpoiler":false}'::jsonb]`,
      })
      .where("id", "=", first)
      .execute()
    await read(services, reader.userId, await chapter(first, 1), "2026-05-10 10:00:00")
    await read(services, reader.userId, await chapter(first, 2), "2026-05-10 10:05:00")

    const res = await api<{ reading: { genres: unknown[] } }>(
      app,
      `/users/${reader.userId}/stats?contentRating=NORMAL`,
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.reading.genres).toEqual([{ genre: "ACTION", count: 1 }])
  })

  test("returns the lifetime experience on the profile", async ({ app, services }) => {
    const { reader, first, chapter } = await seedReads(services)
    const chapterId = await chapter(first, 1)

    await services.db
      .insertInto("readingRewards")
      .values([
        { userId: reader.userId, chapterId, mediaId: first, number: 1, pages: 30, points: 1 },
        { userId: reader.userId, chapterId, mediaId: first, number: 2, pages: 12, points: 0 },
      ])
      .execute()

    const { username } = await services.db
      .selectFrom("users")
      .select("username")
      .where("id", "=", reader.userId)
      .executeTakeFirstOrThrow()
    const res = await api<{ xp: number }>(app, `/users/by-username/${username}`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.xp).toBe(42)
  })
})
