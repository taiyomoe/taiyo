import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MAIN_COVER_ID = "a56cc54d-7776-4787-9b21-97a4674b80bc"

type ManagedList = {
  id: string
  name: string
  visibility: string
  itemCount: number
  upvoteCount: number
  owner: { id: string; username: string }
  coverUrl: string | null
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /lists/managed", () => {
  test("lists the PUBLIC lists newest first, with their owner and first cover", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)
    const token = `Zq${randomUUID().slice(0, 8)}`
    const insertList = (values: {
      name: string
      visibility: "PUBLIC" | "PRIVATE"
      createdAt: Date
      deletedAt?: Date
    }) =>
      services.db
        .insertInto("userLists")
        .values({ userId, upvoteCount: 3, ...values })
        .returning("id")
        .executeTakeFirstOrThrow()
    const older = await insertList({
      name: `${token} older`,
      visibility: "PUBLIC",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    })
    const newer = await insertList({
      name: `${token} newer`,
      visibility: "PUBLIC",
      createdAt: new Date("2026-02-01T00:00:00Z"),
    })
    const hidden = await insertList({
      name: `${token} hidden`,
      visibility: "PRIVATE",
      createdAt: new Date("2026-03-01T00:00:00Z"),
    })
    const deleted = await insertList({
      name: `${token} deleted`,
      visibility: "PUBLIC",
      createdAt: new Date("2026-03-01T00:00:00Z"),
      deletedAt: new Date(),
    })

    await services.db
      .insertInto("userListItems")
      .values({ listId: older.id, mediaId: SEEDED_MEDIA_ID, position: 0 })
      .execute()

    const res = await api<ManagedList[]>(app, `/lists/managed?search=${token}`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const ids = res.body.data.map((list) => list.id)

    expect(ids).toEqual([newer.id, older.id])
    expect(ids).not.toContain(hidden.id)
    expect(ids).not.toContain(deleted.id)
    expect(res.body.meta).toMatchObject({ total: 2 })
    expect(res.body.data[0]).toMatchObject({
      visibility: "PUBLIC",
      itemCount: 0,
      upvoteCount: 3,
      owner: { id: userId },
      coverUrl: null,
    })
    expect(res.body.data[1]?.itemCount).toBe(1)
    expect(res.body.data[1]?.coverUrl).toContain(
      `/medias/${SEEDED_MEDIA_ID}/covers/${SEEDED_MAIN_COVER_ID}.jpg`,
    )
  })

  test("searches by the username of the owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId } = await signInAs(services)
    const { username } = await services.db
      .selectFrom("users")
      .select("username")
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Anything", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<ManagedList[]>(app, `/lists/managed?search=${username}`, { headers })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((item) => item.id)).toEqual([list.id])
    expect(res.body.data[0]?.owner).toMatchObject({ id: userId, username })
  })

  test("searches by the display name of the owner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const { userId } = await signInAs(services)
    const displayUsername = `Owner ${userId.slice(0, 8)}`

    await services.db
      .updateTable("users")
      .set({ displayUsername })
      .where("id", "=", userId)
      .execute()

    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Anything", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<ManagedList[]>(
      app,
      `/lists/managed?search=${encodeURIComponent(displayUsername)}`,
      { headers },
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.map((item) => item.id)).toEqual([list.id])
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/lists/managed"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })

    expectFailure(await api(app, "/lists/managed", { headers }), 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await api(app, "/lists/managed", { headers }), 403, "FORBIDDEN")
  })

  test("rejects an invalid page with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })

    expectFailure(await api(app, "/lists/managed?page=0", { headers }), 422, "VALIDATION_ERROR")
  })
})
