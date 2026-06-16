import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

// /medias/search has the most permissive budget in the first pass — 60/min
// — because it's the one public mutation. Verify the gate trips at all and
// the 429 keeps the standard envelope. The X-Forwarded-For is a fresh UUID
// per test invocation so the counter starts empty regardless of leftover
// Dragonfly state from prior runs.
describe("POST /medias/search rate limit", () => {
  test("returns 429 after the per-IP budget is exhausted", async ({ app }) => {
    const headers = { "x-forwarded-for": `203.0.113.${randomUUID()}` }
    const fire = () => api(app, "/medias/search", { method: "POST", headers, json: {} })
    const first: { status: number }[] = []

    for (let i = 0; i < 60; i++) {
      first.push(await fire())
    }

    expect(first.every((r) => r.status === 201)).toBe(true)

    const blocked = await fire()

    expect(blocked.status).toBe(429)

    if (blocked.body.success) {
      throw new Error("Expected failure")
    }

    expect(blocked.body.code).toBe("RATE_LIMITED")
  })
})
