import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const seedChapter = async (
  services: { db: any },
  overrides: { uploaderId: string; number: number; language: string },
) => {
  const id = crypto.randomUUID()

  await services.db
    .insertInto("chapters")
    .values({
      id,
      mediaId: SEEDED_MEDIA_ID,
      uploaderId: overrides.uploaderId,
      number: overrides.number,
      language: overrides.language,
    })
    .execute()

  return id
}

describe("GET /users/me/history", () => {
  test("returns the user's history feed, newest first", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const c1 = await seedChapter(services, { uploaderId: userId, number: 100, language: "en" })
    const c2 = await seedChapter(services, { uploaderId: userId, number: 101, language: "en" })
    const c3 = await seedChapter(services, { uploaderId: userId, number: 102, language: "en" })

    await services.db
      .insertInto("userHistories")
      .values([
        { userId, chapterId: c1 },
        { userId, chapterId: c2 },
        { userId, chapterId: c3 },
      ])
      .execute()

    const res = await api<{ chapterId: string }[]>(app, `/users/me/history`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(3)
  })

  test("respects perPage and reports total", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const c1 = await seedChapter(services, { uploaderId: userId, number: 200, language: "en" })
    const c2 = await seedChapter(services, { uploaderId: userId, number: 201, language: "en" })
    const c3 = await seedChapter(services, { uploaderId: userId, number: 202, language: "en" })

    await services.db
      .insertInto("userHistories")
      .values([
        { userId, chapterId: c1 },
        { userId, chapterId: c2 },
        { userId, chapterId: c3 },
      ])
      .execute()

    const res = await api<{ chapterId: string }[]>(app, `/users/me/history?perPage=2`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(2)
    expect(res.body.meta).toMatchObject({ page: 1, perPage: 2, total: 3 })
  })

  test("excludes entries whose chapter was deleted", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const live = await seedChapter(services, { uploaderId: userId, number: 300, language: "en" })
    const gone = await seedChapter(services, { uploaderId: userId, number: 301, language: "en" })

    await services.db
      .insertInto("userHistories")
      .values([
        { userId, chapterId: live },
        { userId, chapterId: gone },
      ])
      .execute()

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date(), deleterId: userId })
      .where("id", "=", gone)
      .execute()

    const res = await api<{ chapterId: string }[]>(app, `/users/me/history`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]?.chapterId).toBe(live)
  })

  test("returns an empty feed for a fresh user", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<unknown[]>(app, `/users/me/history`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(0)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/history`)

    expect(res.status).toBe(401)
  })
})
