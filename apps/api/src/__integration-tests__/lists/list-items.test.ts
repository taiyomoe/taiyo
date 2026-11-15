import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID_A = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MEDIA_ID_B = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

describe("POST /lists/:id/items", () => {
  test("owner adds a media — auto position 0 on empty list", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<{ position: number }>(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers,
      json: { mediaId: SEEDED_MEDIA_ID_A },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.position).toBe(0)
  })

  test("explicit position is honored", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<{ position: number }>(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers,
      json: { mediaId: SEEDED_MEDIA_ID_A, position: 7 },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.position).toBe(7)
  })

  test("returns LIST_ITEM_EXISTS on duplicate", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await api(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers,
      json: { mediaId: SEEDED_MEDIA_ID_A },
    })

    const res = await api(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers,
      json: { mediaId: SEEDED_MEDIA_ID_A },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("LIST_ITEM_EXISTS")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers,
      json: { mediaId: randomUUID() },
    })

    expect(res.status).toBe(404)
  })

  test("non-owner gets FORBIDDEN", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/items`, {
      method: "POST",
      headers: otherHeaders,
      json: { mediaId: SEEDED_MEDIA_ID_A },
    })

    expect(res.status).toBe(403)
  })
})

describe("DELETE /lists/:id/items/:mediaId", () => {
  test("owner removes an item", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("userListItems")
      .values({ listId: list.id, mediaId: SEEDED_MEDIA_ID_A, position: 0 })
      .execute()

    const res = await api(app, `/lists/${list.id}/items/${SEEDED_MEDIA_ID_A}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)
  })

  test("returns LIST_ITEM_NOT_FOUND when item absent", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/items/${SEEDED_MEDIA_ID_A}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("LIST_ITEM_NOT_FOUND")
  })
})

describe("PATCH /lists/:id/items/:mediaId", () => {
  test("owner repositions an item", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("userListItems")
      .values({ listId: list.id, mediaId: SEEDED_MEDIA_ID_A, position: 0 })
      .execute()

    const res = await api(app, `/lists/${list.id}/items/${SEEDED_MEDIA_ID_A}`, {
      method: "PATCH",
      headers,
      json: { position: 5 },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userListItems")
      .select("position")
      .where("listId", "=", list.id)
      .where("mediaId", "=", SEEDED_MEDIA_ID_A)
      .executeTakeFirstOrThrow()

    expect(row.position).toBe(5)
  })

  test("returns LIST_ITEM_NOT_FOUND when item absent", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/items/${SEEDED_MEDIA_ID_B}`, {
      method: "PATCH",
      headers,
      json: { position: 0 },
    })

    expect(res.status).toBe(404)
  })
})
