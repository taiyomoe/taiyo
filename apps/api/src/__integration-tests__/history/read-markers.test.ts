import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { type ApiResult, api } from "../helpers/request"
import { seedChapter, seedMedia } from "../helpers/seed"
import { test } from "../setup"

type App = Parameters<typeof api>[0]

const dataOf = <TData>(res: ApiResult<TData>) => {
  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const seedSeries = async (services: Services) => {
  const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, uploaderId)
  const chapter = { mediaId, uploaderId }
  const oneEn = await seedChapter(services, { ...chapter, number: 1 })
  const onePt = await seedChapter(services, { ...chapter, number: 1, language: "pt_br" })
  const twoEn = await seedChapter(services, { ...chapter, number: 2 })
  const threeEn = await seedChapter(services, { ...chapter, number: 3 })
  const fourPending = await seedChapter(services, { ...chapter, number: 4, status: "PENDING" })

  return { mediaId, oneEn, onePt, twoEn, threeEn, fourPending }
}
const historyOf = async ({ db }: Services, userId: string) =>
  db
    .selectFrom("userHistories")
    .select(["chapterId", "completed", "pageId"])
    .where("userId", "=", userId)
    .orderBy("chapterId")
    .execute()
const readFlags = async (app: App, mediaId: string, headers: Record<string, string>) =>
  dataOf(
    await api<Array<{ number: number; language: string; read: boolean }>>(
      app,
      `/medias/${mediaId}/chapters?sort=number&order=asc`,
      { headers },
    ),
  ).map(({ number, language, read }) => `${number}:${language}:${read}`)

describe("PUT /chapters/:id/read", () => {
  test("adds a completed entry for an unopened chapter", async ({ app, services }) => {
    const { mediaId, oneEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)
    const res = await api(app, `/chapters/${oneEn}/read`, { method: "PUT", headers })

    expect(res.status).toBe(200)
    expect(await historyOf(services, userId)).toEqual([
      { chapterId: oneEn, completed: true, pageId: null },
    ])
    expect(await readFlags(app, mediaId, headers)).toEqual([
      "1:en:true",
      "1:pt_br:true",
      "2:en:false",
      "3:en:false",
    ])
  })

  test("completes an opened chapter and keeps its page", async ({ app, services }) => {
    const { twoEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)
    const pageId = randomUUID()

    await services.db
      .insertInto("userHistories")
      .values({ userId, chapterId: twoEn, pageId })
      .execute()

    await api(app, `/chapters/${twoEn}/read`, { method: "PUT", headers })

    expect(await historyOf(services, userId)).toEqual([
      { chapterId: twoEn, completed: true, pageId },
    ])
  })

  test("never earns points", async ({ app, services }) => {
    const { threeEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)

    await api(app, `/chapters/${threeEn}/read`, { method: "PUT", headers })

    const rewards = await services.db
      .selectFrom("readingRewards")
      .select("id")
      .where("userId", "=", userId)
      .execute()

    expect(rewards).toEqual([])
  })

  test("requires a signed-in user", async ({ app, services }) => {
    const { oneEn } = await seedSeries(services)
    const res = await api(app, `/chapters/${oneEn}/read`, { method: "PUT" })

    expect(res.status).toBe(401)
  })
})

describe("DELETE /chapters/:id/read", () => {
  test("removes every version of the chapter number", async ({ app, services }) => {
    const { mediaId, oneEn, onePt, twoEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userHistories")
      .values([
        { userId, chapterId: oneEn, completed: true },
        { userId, chapterId: onePt },
        { userId, chapterId: twoEn, completed: true },
      ])
      .execute()

    const res = await api(app, `/chapters/${onePt}/read`, { method: "DELETE", headers })

    expect(res.status).toBe(200)
    expect(await historyOf(services, userId)).toEqual([
      { chapterId: twoEn, completed: true, pageId: null },
    ])
    expect(await readFlags(app, mediaId, headers)).toEqual([
      "1:en:false",
      "1:pt_br:false",
      "2:en:true",
      "3:en:false",
    ])
  })
})

describe("PUT /medias/:id/read", () => {
  test("marks every published number once and completes opened ones", async ({ app, services }) => {
    const { mediaId, oneEn, onePt, twoEn, threeEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)

    await services.db.insertInto("userHistories").values({ userId, chapterId: onePt }).execute()

    const res = await api<{ marked: number }>(app, `/medias/${mediaId}/read`, {
      method: "PUT",
      headers,
    })

    expect(res.status).toBe(200)
    expect(dataOf(res).marked).toBe(3)

    const history = await historyOf(services, userId)

    expect(history).toHaveLength(3)
    expect(history).toEqual(
      expect.arrayContaining([
        { chapterId: onePt, completed: true, pageId: null },
        { chapterId: twoEn, completed: true, pageId: null },
        { chapterId: threeEn, completed: true, pageId: null },
      ]),
    )
    expect(history.map(({ chapterId }) => chapterId)).not.toContain(oneEn)
    expect(await readFlags(app, mediaId, headers)).toEqual([
      "1:en:true",
      "1:pt_br:true",
      "2:en:true",
      "3:en:true",
    ])
  })

  test("keeps marked chapters out of the feed and the resume target", async ({ app, services }) => {
    const { mediaId, twoEn } = await seedSeries(services)
    const { headers, userId } = await signInAs(services)
    const pageId = randomUUID()

    await services.db
      .insertInto("userHistories")
      .values({ userId, chapterId: twoEn, pageId, completed: true })
      .execute()

    await api(app, `/medias/${mediaId}/read`, { method: "PUT", headers })

    const feed = dataOf(
      await api<Array<{ chapterId: string }>>(app, "/users/me/history", { headers }),
    )
    const progress = dataOf(
      await api<{
        readCount: number
        lastRead: { id: string } | null
        next: { id: string } | null
      }>(app, `/users/me/progress/${mediaId}`, { headers }),
    )

    expect(feed.map(({ chapterId }) => chapterId)).toEqual([twoEn])
    expect(progress.readCount).toBe(3)
    expect(progress.lastRead?.id).toBe(twoEn)
    expect(progress.next).toBeNull()
  })

  test("offers no next chapter when everything is marked without reading", async ({
    app,
    services,
  }) => {
    const { mediaId } = await seedSeries(services)
    const { headers } = await signInAs(services)

    await api(app, `/medias/${mediaId}/read`, { method: "PUT", headers })

    const progress = dataOf(
      await api<{ lastRead: { id: string } | null; next: { id: string } | null }>(
        app,
        `/users/me/progress/${mediaId}`,
        { headers },
      ),
    )

    expect(progress.lastRead).toBeNull()
    expect(progress.next).toBeNull()
  })
})
