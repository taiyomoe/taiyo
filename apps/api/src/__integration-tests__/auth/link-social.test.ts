import type { Hono } from "hono"
import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const linkSocial = async (app: Hono, headers: Record<string, string>) => {
  const res = await app.request("/api/auth/link-social", {
    method: "POST",
    headers: {
      ...headers,
      origin: "http://localhost",
      "content-type": "application/json",
      "cf-connecting-ip": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify({ provider: "discord" }),
  })

  return { status: res.status, body: await res.text() }
}

describe("POST /api/auth/link-social", () => {
  test("needs a recent sign-in", async ({ app, services }) => {
    const fresh = await signInAs(services)
    const stale = await signInAs(services)

    await services.db
      .updateTable("sessions")
      .set({ createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) })
      .where("userId", "=", stale.userId)
      .execute()

    const refused = await linkSocial(app, stale.headers)

    expect(refused.status).toBe(403)
    expect(refused.body).toContain("SESSION_NOT_FRESH")
    expect((await linkSocial(app, fresh.headers)).body).not.toContain("SESSION_NOT_FRESH")
  })
})
