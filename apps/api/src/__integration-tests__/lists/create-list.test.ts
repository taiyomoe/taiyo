import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID_A = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MEDIA_ID_B = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

describe("POST /users/me/lists", () => {
  test("creates a list with its titles in order", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<{ id: string }>(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "Picks", mediaIds: [SEEDED_MEDIA_ID_B, SEEDED_MEDIA_ID_A] },
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const items = await services.db
      .selectFrom("userListItems")
      .select("mediaId")
      .where("listId", "=", res.body.data.id)
      .orderBy("position", "asc")
      .execute()

    expect(items.map((item) => item.mediaId)).toEqual([SEEDED_MEDIA_ID_B, SEEDED_MEDIA_ID_A])
  })

  test("rejects unknown titles with MEDIA_NOT_FOUND", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "Picks", mediaIds: [randomUUID()] },
    })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, code: "MEDIA_NOT_FOUND" })
  })

  test("rejects duplicate titles", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "Picks", mediaIds: [SEEDED_MEDIA_ID_A, SEEDED_MEDIA_ID_A] },
    })

    expect(res.status).toBe(422)
  })

  test("stops at the per-user list limit", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLists")
      .values(Array.from({ length: 100 }, (_, index) => ({ userId, name: `List ${index}` })))
      .execute()

    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "One more" },
    })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ success: false, code: "LIST_LIMIT_REACHED" })
  })

  test("creates a list with explicit PUBLIC visibility", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await api<{ id: string; visibility: string }>(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "Best shounen", visibility: "PUBLIC" },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.visibility).toBe("PUBLIC")

    const row = await services.db
      .selectFrom("userLists")
      .selectAll()
      .where("id", "=", res.body.data.id)
      .executeTakeFirstOrThrow()

    expect(row.userId).toBe(userId)
    expect(row.name).toBe("Best shounen")
    expect(row.visibility).toBe("PUBLIC")
  })

  test("defaults visibility to PRIVATE when omitted", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<{ id: string; visibility: string }>(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "My drafts" },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data.visibility).toBe("PRIVATE")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      json: { name: "Anon" },
    })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "X" },
    })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for an empty name", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/lists`, {
      method: "POST",
      headers,
      json: { name: "" },
    })

    expect(res.status).toBe(422)
  })
})
