import type { Hono } from "hono"
import { randomInt, randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { z } from "zod"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const ORIGIN = "http://localhost"
const NON_ADMIN_ROLES = ["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const
const NOT_ALLOWED: unknown = expect.stringMatching(/^YOU_ARE_NOT_ALLOWED_TO_/)
const auth = async (
  app: Hono,
  path: string,
  cookie: string,
  { json, method = "POST" }: { json?: unknown; method?: string } = {},
) => {
  const res = await app.request(`/api/auth${path}`, {
    method,
    headers: {
      cookie,
      origin: ORIGIN,
      "x-forwarded-for": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
      ...(json === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(json === undefined ? {} : { body: JSON.stringify(json) }),
  })
  const body: unknown =
    res.headers.get("content-type")?.includes("json") === true ? await res.json() : null

  return { status: res.status, body, setCookies: res.headers.getSetCookie() }
}
const cookieOf = (setCookies: string[]) =>
  setCookies
    .map((cookie) => cookie.split(";")[0] ?? "")
    .filter((cookie) => !cookie.endsWith("="))
    .join("; ")
const sessionsOf = (services: Services, userId: string) =>
  services.db
    .selectFrom("sessions")
    .select(["token", "impersonatedBy"])
    .where("userId", "=", userId)
    .execute()

describe("Better Auth admin plugin", () => {
  test("lets an admin impersonate a regular user, then come back", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const target = await signInAs(services, { role: "MODERATOR" })
    const started = await auth(app, "/admin/impersonate-user", admin.headers.Cookie, {
      json: { userId: target.userId },
    })

    expect(started.status).toBe(200)
    expect(await sessionsOf(services, target.userId)).toContainEqual(
      expect.objectContaining({ impersonatedBy: admin.userId }),
    )

    const impersonating = cookieOf(started.setCookies)
    const session = await auth(app, "/get-session", impersonating, { method: "GET" })

    expect(session.body).toMatchObject({
      user: { id: target.userId },
      session: { impersonatedBy: admin.userId },
    })

    const stopped = await auth(app, "/admin/stop-impersonating", impersonating)
    const back = await auth(app, "/get-session", cookieOf(stopped.setCookies), { method: "GET" })

    expect(stopped.status).toBe(200)
    expect(back.body).toMatchObject({ user: { id: admin.userId } })
    expect(
      (await sessionsOf(services, target.userId)).filter((row) => row.impersonatedBy !== null),
    ).toEqual([])
  })

  test("never lets an admin act as or for another admin, or for themselves", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const other = await signInAs(services, { role: "ADMIN" })

    for (const userId of [other.userId, admin.userId]) {
      for (const [path, json] of [
        ["/admin/impersonate-user", { userId }],
        ["/admin/set-user-password", { userId, newPassword: randomUUID() }],
        ["/admin/list-user-sessions", { userId }],
        ["/admin/revoke-user-sessions", { userId }],
      ] as const) {
        const res = await auth(app, path, admin.headers.Cookie, { json })

        expect({ path, userId, ...res }).toMatchObject({
          path,
          userId,
          status: 403,
          body: { code: "FORBIDDEN_TARGET" },
        })
      }
    }

    const [otherSession] = await sessionsOf(services, other.userId)
    const revoke = await auth(app, "/admin/revoke-user-session", admin.headers.Cookie, {
      json: { sessionToken: otherSession?.token },
    })

    expect(revoke).toMatchObject({ status: 403, body: { code: "FORBIDDEN_TARGET" } })
    expect(await sessionsOf(services, other.userId)).toHaveLength(1)
  })

  test("keeps impersonation, passwords and sessions to admins", async ({ app, services }) => {
    const target = await signInAs(services)

    for (const role of NON_ADMIN_ROLES) {
      const actor = await signInAs(services, { role })

      for (const [path, json] of [
        ["/admin/impersonate-user", { userId: target.userId }],
        ["/admin/set-user-password", { userId: target.userId, newPassword: randomUUID() }],
        ["/admin/list-user-sessions", { userId: target.userId }],
        ["/admin/revoke-user-sessions", { userId: target.userId }],
      ] as const) {
        const res = await auth(app, path, actor.headers.Cookie, { json })

        expect({ role, path, ...res }).toMatchObject({
          role,
          path,
          status: 403,
          body: { code: "FORBIDDEN_TARGET" },
        })
      }
    }

    expect(await sessionsOf(services, target.userId)).toHaveLength(1)
  })

  test("lets an admin set a regular user's password", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const email = `${randomUUID()}@test.local`
    const target = await signInAs(services, { email })
    const newPassword = `pw-${randomUUID()}`
    const set = await auth(app, "/admin/set-user-password", admin.headers.Cookie, {
      json: { userId: target.userId, newPassword },
    })
    const signIn = await auth(app, "/sign-in/email", "", { json: { email, password: newPassword } })

    expect(set.status).toBe(200)
    expect(signIn.status).toBe(200)
    expect(signIn.body).toMatchObject({ user: { id: target.userId } })
  })

  test("lets an admin list and revoke a regular user's sessions", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const email = `${randomUUID()}@test.local`
    const target = await signInAs(services, { email, role: "UPLOADER" })
    const password = `pw-${randomUUID()}`

    await auth(app, "/admin/set-user-password", admin.headers.Cookie, {
      json: { userId: target.userId, newPassword: password },
    })

    const signIn = await auth(app, "/sign-in/email", "", { json: { email, password } })
    const targetCookie = cookieOf(signIn.setCookies)
    const listed = await auth(app, "/admin/list-user-sessions", admin.headers.Cookie, {
      json: { userId: target.userId },
    })
    const sessions = z
      .object({ sessions: z.array(z.object({ token: z.string(), userId: z.string() })) })
      .parse(listed.body).sessions
    const signedIn = sessions.find((session) => targetCookie.includes(session.token))
    const rows = await sessionsOf(services, target.userId)

    expect(listed.status).toBe(200)
    expect(new Set(sessions.map((session) => session.token))).toEqual(
      new Set(rows.map((row) => row.token)),
    )
    expect(signedIn).toBeDefined()

    const revoked = await auth(app, "/admin/revoke-user-session", admin.headers.Cookie, {
      json: { sessionToken: signedIn?.token },
    })
    const after = await auth(app, "/get-session", targetCookie, { method: "GET" })

    expect(revoked.status).toBe(200)
    expect(after.body).toBeNull()
  })

  test("leaves bans, roles and user records to Taiyō's own routes", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const target = await signInAs(services)

    for (const [path, json] of [
      ["/admin/ban-user", { userId: target.userId }],
      ["/admin/unban-user", { userId: target.userId }],
      ["/admin/set-role", { userId: target.userId, role: "ADMIN" }],
      [
        "/admin/create-user",
        { email: `${randomUUID()}@test.local`, password: randomUUID(), name: "x" },
      ],
      ["/admin/update-user", { userId: target.userId, data: { name: "Renamed" } }],
      ["/admin/remove-user", { userId: target.userId }],
    ] as const) {
      const res = await auth(app, path, admin.headers.Cookie, { json })

      expect({ path, ...res }).toMatchObject({
        path,
        status: 403,
        body: { code: NOT_ALLOWED },
      })
    }

    for (const path of ["/admin/list-users", `/admin/get-user?id=${target.userId}`]) {
      const res = await auth(app, path, admin.headers.Cookie, { method: "GET" })

      expect({ path, ...res }).toMatchObject({
        path,
        status: 403,
        body: { code: NOT_ALLOWED },
      })
    }

    const row = await services.db
      .selectFrom("users")
      .select(["role", "banned", "name"])
      .where("id", "=", target.userId)
      .executeTakeFirstOrThrow()

    expect(row).toMatchObject({ role: "USER", banned: false })
    expect(row.name).not.toBe("Renamed")
  })
})
