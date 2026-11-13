import type { Hono } from "hono"
import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const ORIGIN = "http://localhost"
const auth = async (app: Hono, path: string, cookie: string, json?: unknown) => {
  const res = await app.request(`/api/auth${path}`, {
    method: json === undefined ? "GET" : "POST",
    headers: {
      cookie,
      origin: ORIGIN,
      "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
      ...(json === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(json === undefined ? {} : { body: JSON.stringify(json) }),
  })
  const body: unknown = await res.json()

  return { status: res.status, body, setCookies: res.headers.getSetCookie() }
}
// A password sign-in goes through Better Auth, so the session is also cached with its user.
const signInWithPassword = async (app: Hono, services: Services, email: string) => {
  const { setCookies } = await auth(app, "/sign-in/email", "", { email, password: "password123" })
  const user = await services.db
    .selectFrom("users")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirstOrThrow()

  return {
    userId: user.id,
    cookie: setCookies
      .map((cookie) => cookie.split(";")[0] ?? "")
      .filter((cookie) => !cookie.endsWith("="))
      .join("; "),
  }
}

describe("Better Auth sessions", () => {
  test("lose the admin endpoints once the admin is demoted", async ({ app, services }) => {
    const demoted = await signInWithPassword(app, services, "admin@gmail.com")
    const admin = await signInAs(services, { role: "ADMIN" })
    const target = await signInAs(services)

    expect(
      (await auth(app, "/admin/list-user-sessions", demoted.cookie, { userId: target.userId }))
        .status,
    ).toBe(200)

    await api(app, `/users/${demoted.userId}/role`, {
      method: "PATCH",
      headers: admin.headers,
      json: { role: "USER" },
    })

    expect(
      (await auth(app, "/admin/list-user-sessions", demoted.cookie, { userId: target.userId }))
        .status,
    ).toBe(403)
  })

  test("end once the user is banned", async ({ app, services }) => {
    const banned = await signInWithPassword(app, services, "user@gmail.com")
    const admin = await signInAs(services, { role: "ADMIN" })

    expect((await auth(app, "/get-session", banned.cookie)).body).toMatchObject({
      user: { id: banned.userId },
    })

    await api(app, `/users/${banned.userId}/ban`, {
      method: "POST",
      headers: admin.headers,
      json: { reason: "Spam", days: 1 },
    })

    expect((await auth(app, "/get-session", banned.cookie)).body).toBeNull()
  })
})
