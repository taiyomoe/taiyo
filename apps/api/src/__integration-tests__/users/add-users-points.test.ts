import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
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
const getPoints = async ({ db }: Services, userId: string) => {
  const row = await db
    .selectFrom("userProfiles")
    .select("points")
    .where("userId", "=", userId)
    .executeTakeFirst()

  return row?.points
}

describe("POST /users/points", () => {
  test("adds the points, creates missing profiles and reports the missing users", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const withProfile = await signInAs(services)
    const withoutProfile = await signInAs(services)
    const missing = randomUUID()

    await services.db
      .insertInto("userProfiles")
      .values({ userId: withProfile.userId, points: 100 })
      .execute()

    const res = await api<BulkResult>(app, "/users/points", {
      method: "POST",
      headers: admin.headers,
      json: { userIds: [withProfile.userId, withoutProfile.userId, missing], amount: 250 },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [withProfile.userId, withoutProfile.userId],
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })
    expect(await getPoints(services, withProfile.userId)).toBe(350)
    expect(await getPoints(services, withoutProfile.userId)).toBe(250)

    const [log] = await findAuditLogs(services, "admin.POINTS_GRANT_MANY")

    expect(log?.event).toMatchObject({
      audit: {
        changes: { after: { userIds: [withProfile.userId, withoutProfile.userId], amount: 250 } },
      },
    })
  })

  test("never takes a balance below 0", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const rich = await signInAs(services)
    const poor = await signInAs(services)
    const withoutProfile = await signInAs(services)

    await services.db
      .insertInto("userProfiles")
      .values([
        { userId: rich.userId, points: 1000 },
        { userId: poor.userId, points: 50 },
      ])
      .execute()

    const res = await api(app, "/users/points", {
      method: "POST",
      headers: admin.headers,
      json: { userIds: [rich.userId, poor.userId, withoutProfile.userId], amount: -200 },
    })

    expect(res.status).toBe(201)
    expect(await getPoints(services, rich.userId)).toBe(800)
    expect(await getPoints(services, poor.userId)).toBe(0)
    expect(await getPoints(services, withoutProfile.userId)).toBe(0)
  })

  test("shows the new balance in the user list", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const target = await signInAs(services)
    const search = `?search=${target.userId.replace(/-/g, "").slice(0, 12)}`
    const before = await api(app, `/users${search}`, { headers: admin.headers })

    expect(before.body).toMatchObject({ data: [{ id: target.userId, points: 0, title: null }] })

    await api(app, "/users/points", {
      method: "POST",
      headers: admin.headers,
      json: { userIds: [target.userId], amount: 42 },
    })

    const after = await api(app, `/users${search}`, { headers: admin.headers })

    expect(after.body).toMatchObject({ data: [{ id: target.userId, points: 42 }] })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/users/points", {
      method: "POST",
      json: { userIds: [randomUUID()], amount: 10 },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned admins with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/users/points", {
      method: "POST",
      headers,
      json: { userIds: [randomUUID()], amount: 10 },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const res = await api(app, "/users/points", {
      method: "POST",
      headers,
      json: { userIds: [user.userId], amount: 10 },
    })

    expectFailure(res, 403, "FORBIDDEN")
    expect(await getPoints(services, user.userId)).toBeUndefined()
  })

  test("rejects an amount of 0 with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/users/points", {
      method: "POST",
      headers,
      json: { userIds: [randomUUID()], amount: 0 },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
