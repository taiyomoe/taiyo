import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID_A = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MEDIA_ID_B = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

describe("GET /lists/:id", () => {
  test("PUBLIC list is readable without authentication", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Open", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`)

    expect(res.status).toBe(200)
  })

  test("PRIVATE list is readable by its owner", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Private", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, { headers })

    expect(res.status).toBe(200)
  })

  test("PRIVATE list 404s for an unauthenticated reader", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Private", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`)

    expect(res.status).toBe(404)
  })

  test("PRIVATE list 404s for an authenticated non-owner", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "Private", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, { headers: otherHeaders })

    expect(res.status).toBe(404)
  })

  test("returns LIST_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/lists/${randomUUID()}`)

    expect(res.status).toBe(404)
  })

  test("returns items ordered by position", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Ordered", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("userListItems")
      .values([
        { listId: list.id, mediaId: SEEDED_MEDIA_ID_A, position: 1 },
        { listId: list.id, mediaId: SEEDED_MEDIA_ID_B, position: 0 },
      ])
      .execute()

    const res = await api<{ items: { mediaId: string; position: number }[] }>(
      app,
      `/lists/${list.id}`,
    )

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.items).toHaveLength(2)
    expect(res.body.data.items[0]?.mediaId).toBe(SEEDED_MEDIA_ID_B)
    expect(res.body.data.items[1]?.mediaId).toBe(SEEDED_MEDIA_ID_A)
  })
})
