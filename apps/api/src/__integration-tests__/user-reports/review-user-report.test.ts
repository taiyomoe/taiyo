import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const seedReport = async (services: Services) => {
  const reporter = await signInAs(services)
  const { userId } = await signInAs(services)
  const { id } = await services.db
    .insertInto("userReports")
    .values({ userId, reporterId: reporter.userId, reason: "INAPPROPRIATE_PROFILE" })
    .returning("id")
    .executeTakeFirstOrThrow()

  return { id, userId }
}
const review = (
  app: Parameters<typeof api>[0],
  reportId: string,
  headers: Record<string, string> | undefined,
  json: unknown = { status: "RESOLVED" },
) =>
  api(app, `/user-reports/${reportId}/review`, {
    method: "POST",
    ...(headers === undefined ? {} : { headers }),
    json,
  })
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /user-reports/:id/review", () => {
  test("closes the pending report with the outcome and note", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const report = await seedReport(services)
    const res = await review(app, report.id, moderator.headers, {
      status: "RESOLVED",
      note: "  Removed the avatar.  ",
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({ id: report.id })

    const row = await services.db
      .selectFrom("userReports")
      .select(["status", "reviewerId", "reviewerNote"])
      .where("id", "=", report.id)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({
      status: "RESOLVED",
      reviewerId: moderator.userId,
      reviewerNote: "Removed the avatar.",
    })

    expectFailure(
      await review(app, report.id, moderator.headers, { status: "DISMISSED" }),
      409,
      "USER_REPORT_NOT_PENDING",
    )

    const logs = await findAuditLogs(services, "user.report.REVIEW")

    expect(logs.filter((log) => log.targetId === report.id)).toMatchObject([
      { outcome: "success", actorId: moderator.userId, targetType: "userReport" },
      { outcome: "failure", reason: "USER_REPORT_NOT_PENDING" },
    ])
    expect(logs[0]?.event).toMatchObject({
      audit: { target: { userId: report.userId, status: "RESOLVED" } },
    })
  })

  test("rejects an unknown report with USER_REPORT_NOT_FOUND", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })

    expectFailure(await review(app, randomUUID(), headers), 404, "USER_REPORT_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const report = await seedReport(services)

    expectFailure(await review(app, report.id, undefined), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const report = await seedReport(services)

    expectFailure(await review(app, report.id, headers), 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const report = await seedReport(services)

    expectFailure(await review(app, report.id, headers), 403, "FORBIDDEN")
  })

  test("rejects an unknown outcome with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const report = await seedReport(services)

    expectFailure(
      await review(app, report.id, headers, { status: "PENDING" }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
