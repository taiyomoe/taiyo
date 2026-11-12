import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID_A = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MEDIA_ID_B = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

describe("PATCH /lists/:id", () => {
  test("mediaIds replaces and reorders the titles, keeping addedAt", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "L" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const addedAt = new Date("2026-01-01T00:00:00Z")

    await services.db
      .insertInto("userListItems")
      .values({ listId: list.id, mediaId: SEEDED_MEDIA_ID_A, position: 0, addedAt })
      .execute()

    const reordered = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers,
      json: { mediaIds: [SEEDED_MEDIA_ID_B, SEEDED_MEDIA_ID_A] },
    })

    expect(reordered.status).toBe(200)

    const items = await services.db
      .selectFrom("userListItems")
      .select(["mediaId", "position", "addedAt"])
      .where("listId", "=", list.id)
      .orderBy("position", "asc")
      .execute()

    expect(items.map((item) => item.mediaId)).toEqual([SEEDED_MEDIA_ID_B, SEEDED_MEDIA_ID_A])
    expect(items[1]?.addedAt).toEqual(addedAt)

    await api(app, `/lists/${list.id}`, { method: "PATCH", headers, json: { mediaIds: [] } })

    const remaining = await services.db
      .selectFrom("userListItems")
      .select("mediaId")
      .where("listId", "=", list.id)
      .execute()

    expect(remaining).toHaveLength(0)
  })

  test("owner updates name + visibility", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Old", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers,
      json: { name: "New", visibility: "PUBLIC" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userLists")
      .select(["name", "visibility"])
      .where("id", "=", list.id)
      .executeTakeFirstOrThrow()

    expect(row.name).toBe("New")
    expect(row.visibility).toBe("PUBLIC")
  })

  test("non-owner gets FORBIDDEN", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers: otherHeaders } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "Mine" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers: otherHeaders,
      json: { name: "Theirs" },
    })

    expect(res.status).toBe(403)
  })

  test("returns LIST_NOT_FOUND for an unknown id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/lists/${randomUUID()}`, {
      method: "PATCH",
      headers,
      json: { name: "X" },
    })

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for empty body", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "X" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)
  })
})
