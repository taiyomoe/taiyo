import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("POST /users/me/lists", () => {
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
