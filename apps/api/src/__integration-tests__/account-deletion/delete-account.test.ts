import type { AuthEmail } from "@taiyomoe/auth/server"
import type { Hono } from "hono"
import { randomInt } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

const PASSWORD = "a-long-password"
const deleteUser = async (app: Hono, headers: Record<string, string>, json: unknown) => {
  const res = await app.request("/api/auth/delete-user", {
    method: "POST",
    headers: {
      ...headers,
      origin: "http://localhost",
      "content-type": "application/json",
      "cf-connecting-ip": `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`,
    },
    body: JSON.stringify(json),
  })
  const body: unknown = await res.json().catch(() => null)

  return { status: res.status, body, setCookies: res.headers.getSetCookie() }
}
const withPassword = async (services: Services, userId: string) => {
  const context = await services.auth.$context

  await services.db
    .insertInto("accounts")
    .values({
      userId,
      providerId: "credential",
      accountId: userId,
      password: await context.password.hash(PASSWORD),
    })
    .execute()
}
const tokenOf = (mails: AuthEmail[]) => {
  const mail = mails.filter((candidate) => candidate.kind === "delete-account").at(-1)

  if (mail === undefined || !("url" in mail)) {
    throw new Error("No deletion email was sent")
  }

  return new URL(mail.url).searchParams.get("token") ?? ""
}
const userExists = async ({ db }: Services, userId: string) =>
  (await db.selectFrom("users").select("id").where("id", "=", userId).executeTakeFirst()) !==
  undefined
const ageSession = ({ db }: Services, userId: string) =>
  db
    .updateTable("sessions")
    .set({ createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) })
    .where("userId", "=", userId)
    .execute()

describe("POST /api/auth/delete-user", () => {
  test("needs the password of an account that has one", async ({ app, services, authMails }) => {
    const { userId, headers } = await signInAs(services)

    await withPassword(services, userId)

    expect(await deleteUser(app, headers, {})).toMatchObject({
      status: 400,
      body: { code: "PASSWORD_REQUIRED" },
    })
    expect(await deleteUser(app, headers, { password: "not-the-password" })).toMatchObject({
      status: 400,
      body: { code: "INVALID_PASSWORD" },
    })
    expect(authMails).toEqual([])
    expect(await userExists(services, userId)).toBe(true)
  })

  test("emails a confirmation link and deletes nothing yet", async ({
    app,
    services,
    authMails,
  }) => {
    const { userId, headers } = await signInAs(services)

    await withPassword(services, userId)

    const res = await deleteUser(app, headers, { password: PASSWORD })

    expect(res).toMatchObject({ status: 200, body: { message: "Verification email sent" } })
    expect(authMails).toEqual([
      expect.objectContaining({ kind: "delete-account", expiresInMinutes: 60 }),
    ])
    expect(tokenOf(authMails)).not.toBe("")
    expect(await userExists(services, userId)).toBe(true)

    const [log] = await findAuditLogs(services, "user.DELETE_REQUEST")

    expect(log).toMatchObject({ actorId: userId, targetId: userId, outcome: "success" })
  })

  test("lets an account without a password ask from a recent sign-in", async ({
    app,
    services,
    authMails,
  }) => {
    const { userId, headers } = await signInAs(services)

    expect((await deleteUser(app, headers, {})).status).toBe(200)
    expect(authMails).toHaveLength(1)

    await ageSession(services, userId)

    expect(await deleteUser(app, headers, {})).toMatchObject({
      status: 403,
      body: { code: "SESSION_NOT_FRESH" },
    })
  })

  test("deletes the account with the emailed token", async ({ app, services, authMails }) => {
    const { userId, headers } = await signInAs(services)

    await withPassword(services, userId)
    await deleteUser(app, headers, { password: PASSWORD })

    const res = await deleteUser(app, headers, { token: tokenOf(authMails) })

    expect(res).toMatchObject({ status: 200, body: { message: "User deleted" } })
    expect(res.setCookies.some((cookie) => cookie.startsWith("better-auth.session_token=;"))).toBe(
      true,
    )
    expect(await userExists(services, userId)).toBe(false)
    expect(authMails.at(-1)).toMatchObject({ kind: "account-deleted" })

    const sessions = await services.db
      .selectFrom("sessions")
      .select("id")
      .where("userId", "=", userId)
      .execute()

    expect(sessions).toEqual([])

    const [log] = await findAuditLogs(services, "user.DELETE")

    expect(log).toMatchObject({ actorId: userId, targetId: userId, outcome: "success" })
    expect((await deleteUser(app, headers, { token: tokenOf(authMails) })).status).toBe(401)
  })

  test("refuses another account's token", async ({ app, services, authMails }) => {
    const owner = await signInAs(services)
    const other = await signInAs(services)

    await deleteUser(app, owner.headers, {})

    const res = await deleteUser(app, other.headers, { token: tokenOf(authMails) })

    expect(res).toMatchObject({ status: 404, body: { code: "INVALID_TOKEN" } })
    expect(await userExists(services, owner.userId)).toBe(true)
    expect(await userExists(services, other.userId)).toBe(true)

    const [log] = await findAuditLogs(services, "user.DELETE")

    expect(log).toMatchObject({ actorId: other.userId, outcome: "failure" })
  })

  test("refuses a made-up token", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)

    expect((await deleteUser(app, headers, { token: "not-a-token" })).status).toBe(404)
    expect(await userExists(services, userId)).toBe(true)
  })

  test("blocks a group owner, before and after the email", async ({ app, services, authMails }) => {
    const { userId, headers } = await signInAs(services)

    await deleteUser(app, headers, {})

    const token = tokenOf(authMails)
    const groupId = await seedGroup(services, userId, `Owned ${userId.slice(0, 8)}`)

    await seedMembership(services, { groupId, userId, role: "OWNER" })

    expect(await deleteUser(app, headers, {})).toMatchObject({
      status: 403,
      body: { code: "ACCOUNT_OWNS_GROUPS" },
    })
    expect(await deleteUser(app, headers, { token })).toMatchObject({
      status: 403,
      body: { code: "ACCOUNT_OWNS_GROUPS" },
    })
    expect(await userExists(services, userId)).toBe(true)

    await services.db.deleteFrom("groupMemberships").where("userId", "=", userId).execute()

    expect((await deleteUser(app, headers, { token })).status).toBe(200)
    expect(await userExists(services, userId)).toBe(false)
  })

  test("blocks the only admin", async ({ app, services }) => {
    await services.db
      .updateTable("users")
      .set({ role: "USER" })
      .where("role", "=", "ADMIN")
      .execute()

    const admin = await signInAs(services, { role: "ADMIN" })

    expect(await deleteUser(app, admin.headers, {})).toMatchObject({
      status: 403,
      body: { code: "ACCOUNT_LAST_ADMIN" },
    })

    await signInAs(services, { role: "ADMIN" })

    expect((await deleteUser(app, admin.headers, {})).status).toBe(200)
  })

  test("refuses a banned user, even with a session left over", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services, { banned: true })

    expect(await deleteUser(app, headers, {})).toMatchObject({
      status: 403,
      body: { code: "BANNED_USER" },
    })
    expect(await userExists(services, userId)).toBe(true)
  })

  test("refuses a signed-out request", async ({ app }) => {
    expect((await deleteUser(app, {}, {})).status).toBe(401)
  })
})

describe("GET /api/auth/delete-user/callback", () => {
  test("is disabled, so opening a link cannot delete anything", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await app.request("/api/auth/delete-user/callback?token=anything", { headers })

    expect(res.status).toBe(404)
  })
})

describe("GET /users/me/deletion-blockers", () => {
  test("lists the groups the user owns", async ({ app, services }) => {
    const { userId, headers } = await signInAs(services)
    const groupId = await seedGroup(services, userId, `Blocker ${userId.slice(0, 8)}`)

    await seedMembership(services, { groupId, userId, role: "OWNER" })

    const res = await api<{ ownedGroups: Array<{ id: string }>; lastAdmin: boolean }>(
      app,
      "/users/me/deletion-blockers",
      { headers },
    )

    expect(res.body).toMatchObject({
      success: true,
      data: { ownedGroups: [{ id: groupId }], lastAdmin: false },
    })
  })

  test("is empty for a reader", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expect((await api(app, "/users/me/deletion-blockers", { headers })).body).toMatchObject({
      data: { ownedGroups: [], lastAdmin: false },
    })
  })
})
