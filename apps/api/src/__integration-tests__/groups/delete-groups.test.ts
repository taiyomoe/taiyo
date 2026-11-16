import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /groups", () => {
  test("deletes the groups and reports the missing and deleted ones", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const first = await seedGroup(services, userId, "Zyxwv First")
    const second = await seedGroup(services, userId, "Zyxwv Second")
    const deleted = await seedGroup(services, userId, "Zyxwv Deleted")
    const missing = randomUUID()

    await services.db
      .updateTable("groups")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()

    const res = await api<BulkResult>(app, "/groups", {
      method: "DELETE",
      headers,
      json: { groupIds: [first, second, deleted, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: deleted, reason: "NOT_FOUND" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const rows = await services.db
      .selectFrom("groups")
      .select(["deletedAt", "deleterId"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.deletedAt !== null && row.deleterId === userId)).toBe(true)

    const [log] = await findAuditLogs(services, "group.DELETE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { groupIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/groups", {
      method: "DELETE",
      json: { groupIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/groups", {
      method: "DELETE",
      headers,
      json: { groupIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects the owner of the group with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, userId, "Zyxwv Mine")

    await seedMembership(services, { groupId, userId, role: "OWNER" })

    const res = await api(app, "/groups", {
      method: "DELETE",
      headers,
      json: { groupIds: [groupId] },
    })

    expectFailure(res, 403, "FORBIDDEN")

    const row = await services.db
      .selectFrom("groups")
      .select("deletedAt")
      .where("id", "=", groupId)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).toBeNull()
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/groups", { method: "DELETE", headers, json: { groupIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
