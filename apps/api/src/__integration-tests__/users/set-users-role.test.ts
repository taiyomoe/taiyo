import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /users/role", () => {
  test("sets the role, unequips locked cosmetics and reports the skipped users", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const missing = randomUUID()
    const equipped = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: moderator.headers,
      json: { title: "moderator", nameEffect: "azure" },
    })

    expect(equipped.status).toBe(200)

    const res = await api<BulkResult>(app, "/users/role", {
      method: "PATCH",
      headers: admin.headers,
      json: { userIds: [moderator.userId, user.userId, missing, admin.userId], role: "UPLOADER" },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [moderator.userId, user.userId],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: admin.userId, reason: "SELF" },
      ],
    })

    const rows = await services.db
      .selectFrom("users")
      .leftJoin("userProfiles", "userProfiles.userId", "users.id")
      .select(["users.id", "users.role", "users.nameEffect", "userProfiles.title"])
      .where("users.id", "in", [moderator.userId, user.userId, admin.userId])
      .execute()
    const byId = new Map(rows.map((row) => [row.id, row]))

    expect(byId.get(moderator.userId)).toMatchObject({
      role: "UPLOADER",
      nameEffect: null,
      title: null,
    })
    expect(byId.get(user.userId)?.role).toBe("UPLOADER")
    expect(byId.get(admin.userId)?.role).toBe("ADMIN")

    const [log] = await findAuditLogs(services, "admin.ROLE_SET_MANY")

    expect(log?.event).toMatchObject({
      audit: {
        changes: {
          before: { roles: { [moderator.userId]: "MODERATOR", [user.userId]: "USER" } },
          after: { userIds: [moderator.userId, user.userId], role: "UPLOADER" },
        },
      },
    })
  })

  test("keeps the cosmetics the new role still unlocks", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const moderator = await signInAs(services, { role: "MODERATOR" })

    await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: moderator.headers,
      json: { nameEffect: "azure" },
    })

    const res = await api(app, "/users/role", {
      method: "PATCH",
      headers: admin.headers,
      json: { userIds: [moderator.userId], role: "ADMIN" },
    })
    const row = await services.db
      .selectFrom("users")
      .select(["role", "nameEffect"])
      .where("id", "=", moderator.userId)
      .executeTakeFirstOrThrow()

    expect(res.status).toBe(200)
    expect(row).toEqual({ role: "ADMIN", nameEffect: "azure" })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/users/role", {
      method: "PATCH",
      json: { userIds: [randomUUID()], role: "USER" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned admins with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/users/role", {
      method: "PATCH",
      headers,
      json: { userIds: [randomUUID()], role: "USER" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN and changes nothing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const res = await api(app, "/users/role", {
      method: "PATCH",
      headers,
      json: { userIds: [user.userId], role: "ADMIN" },
    })
    const row = await services.db
      .selectFrom("users")
      .select("role")
      .where("id", "=", user.userId)
      .executeTakeFirstOrThrow()

    expectFailure(res, 403, "FORBIDDEN")
    expect(row.role).toBe("USER")
  })

  test("rejects an unknown role with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/users/role", {
      method: "PATCH",
      headers,
      json: { userIds: [randomUUID()], role: "OWNER" },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
