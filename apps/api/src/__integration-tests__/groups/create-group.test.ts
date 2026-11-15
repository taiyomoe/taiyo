import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("POST /groups", () => {
  test("creates a group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api<{ id: string }>(app, `/groups`, {
      method: "POST",
      headers,
      json: { name: `Test Group ${crypto.randomUUID()}`, website: "https://example.com" },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("groups")
      .selectAll()
      .where("id", "=", res.body.data.id)
      .executeTakeFirst()

    expect(row?.name).toMatch(/^Test Group/)
    expect(row?.website).toBe("https://example.com")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/groups`, { method: "POST", json: { name: "x" } })

    expect(res.status).toBe(401)
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/groups`, {
      method: "POST",
      headers,
      json: { name: "x" },
    })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR when name is missing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups`, { method: "POST", headers, json: {} })

    expect(res.status).toBe(422)
  })
})
