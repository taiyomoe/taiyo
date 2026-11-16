import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedStaff } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /staffs", () => {
  test("deletes the staffs and reports the missing and deleted ones", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const first = await seedStaff(services, userId, "Zyxwv First")
    const deleted = await seedStaff(services, userId, "Zyxwv Deleted")
    const missing = randomUUID()

    await services.db
      .updateTable("staffs")
      .set({ deletedAt: new Date() })
      .where("id", "=", deleted)
      .execute()

    const res = await api<BulkResult>(app, "/staffs", {
      method: "DELETE",
      headers,
      json: { staffIds: [first, deleted, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first],
      skipped: [
        { id: deleted, reason: "NOT_FOUND" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const row = await services.db
      .selectFrom("staffs")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", first)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).not.toBeNull()
    expect(row.deleterId).toBe(userId)

    const [log] = await findAuditLogs(services, "staff.DELETE_MANY")

    expect(log?.event).toMatchObject({ audit: { changes: { after: { staffIds: [first] } } } })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/staffs", {
      method: "DELETE",
      json: { staffIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/staffs", {
      method: "DELETE",
      headers,
      json: { staffIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/staffs", {
      method: "DELETE",
      headers,
      json: { staffIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/staffs", { method: "DELETE", headers, json: { staffIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
