import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const seedReport = async (
  services: Services,
  { status = "PENDING" }: { status?: "PENDING" | "RESOLVED" } = {},
) => {
  const reporter = await signInAs(services)
  const { userId } = await signInAs(services)

  return (
    await services.db
      .insertInto("userReports")
      .values({ userId, reporterId: reporter.userId, reason: "SPAM", status })
      .returning("id")
      .executeTakeFirstOrThrow()
  ).id
}
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /user-reports/review", () => {
  test("closes the pending reports with the outcome and note", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const first = await seedReport(services)
    const second = await seedReport(services)
    const resolved = await seedReport(services, { status: "RESOLVED" })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/user-reports/review", {
      method: "POST",
      headers,
      json: {
        reportIds: [first, second, resolved, missing],
        status: "DISMISSED",
        note: "Nothing wrong.",
      },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: resolved, reason: "NOT_PENDING" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const rows = await services.db
      .selectFrom("userReports")
      .select(["status", "reviewerId", "reviewerNote"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toEqual([
      { status: "DISMISSED", reviewerId: userId, reviewerNote: "Nothing wrong." },
      { status: "DISMISSED", reviewerId: userId, reviewerNote: "Nothing wrong." },
    ])

    const [log] = await findAuditLogs(services, "user.report.REVIEW_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { reportIds: [first, second], status: "DISMISSED" } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/user-reports/review", {
      method: "POST",
      json: { reportIds: [randomUUID()], status: "RESOLVED" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const res = await api(app, "/user-reports/review", {
      method: "POST",
      headers,
      json: { reportIds: [randomUUID()], status: "RESOLVED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const reportId = await seedReport(services)
    const res = await api(app, "/user-reports/review", {
      method: "POST",
      headers,
      json: { reportIds: [reportId], status: "RESOLVED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an unknown outcome with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/user-reports/review", {
      method: "POST",
      headers,
      json: { reportIds: [randomUUID()], status: "PENDING" },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
