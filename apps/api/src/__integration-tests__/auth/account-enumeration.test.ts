import type { Hono } from "hono"
import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import { test } from "../setup"

const post = async (app: Hono, path: string, json: unknown) => {
  const res = await app.request(`/api/auth${path}`, {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/json",
      "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify(json),
  })

  return { status: res.status, body: await res.text() }
}

describe("Better Auth email routes", () => {
  test("answer a wrong password the same way for registered and unknown emails", async ({
    app,
  }) => {
    const known = await post(app, "/sign-in/email", {
      email: "user@gmail.com",
      password: "wrong-password-1",
    })
    const unknown = await post(app, "/sign-in/email", {
      email: "nobody-7f3c@gmail.com",
      password: "wrong-password-1",
    })

    expect(known.status).toBe(401)
    expect(known).toEqual(unknown)
  })

  test("answer a magic link request for an unknown email like a sent one", async ({ app }) => {
    const res = await post(app, "/sign-in/magic-link", { email: "nobody-7f3c@gmail.com" })

    expect(res).toMatchObject({ status: 200 })
  })
})
