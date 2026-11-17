import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const report = (
  app: Parameters<typeof api>[0],
  userId: string,
  headers: Record<string, string> | undefined,
  json: unknown = { reason: "INAPPROPRIATE_PROFILE" },
) =>
  api<{ id: string; status: string }>(app, `/users/${userId}/reports`, {
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

describe("POST /users/:id/reports", () => {
  test("files one pending report per reporter and user", async ({ app, services }) => {
    const reporter = await signInAs(services)
    const { userId } = await signInAs(services)
    const created = await report(app, userId, reporter.headers, {
      reason: "HARASSMENT",
      details: "  Their about text insults other readers.  ",
    })

    expect(created.status).toBe(201)

    if (!created.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(created.body)}`)
    }

    expect(created.body.data.status).toBe("PENDING")

    const row = await services.db
      .selectFrom("userReports")
      .select(["userId", "reporterId", "reason", "details", "status"])
      .where("id", "=", created.body.data.id)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({
      userId,
      reporterId: reporter.userId,
      reason: "HARASSMENT",
      details: "Their about text insults other readers.",
      status: "PENDING",
    })

    expectFailure(
      await report(app, userId, reporter.headers, { reason: "SPAM" }),
      409,
      "USER_REPORT_EXISTS",
    )

    const logs = await findAuditLogs(services, "user.report.CREATE")

    expect(logs.map((log) => [log.targetId, log.outcome])).toEqual([
      [userId, "success"],
      [userId, "failure"],
    ])
  })

  test("lets the reporter report the user again once the report is reviewed", async ({
    app,
    services,
  }) => {
    const reporter = await signInAs(services)
    const { userId } = await signInAs(services)

    await services.db
      .insertInto("userReports")
      .values({ userId, reporterId: reporter.userId, reason: "SPAM", status: "DISMISSED" })
      .execute()

    expect((await report(app, userId, reporter.headers)).status).toBe(201)
  })

  test("rejects reporting yourself with USER_REPORT_SELF", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    expectFailure(await report(app, userId, headers), 403, "USER_REPORT_SELF")
  })

  test("rejects an unknown user with USER_NOT_FOUND", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expectFailure(await report(app, randomUUID(), headers), 404, "USER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services)

    expectFailure(await report(app, userId, undefined), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const { userId } = await signInAs(services)

    expectFailure(await report(app, userId, headers), 403, "FORBIDDEN")
  })

  test("rejects an unknown reason with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId } = await signInAs(services)

    expectFailure(
      await report(app, userId, headers, { reason: "STOLEN_WORK" }),
      422,
      "VALIDATION_ERROR",
    )
  })

  test("rejects too many reports in a row with RATE_LIMITED", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const statuses: number[] = []

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const { userId } = await signInAs(services)

      statuses.push((await report(app, userId, headers)).status)
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429])
  })
})
