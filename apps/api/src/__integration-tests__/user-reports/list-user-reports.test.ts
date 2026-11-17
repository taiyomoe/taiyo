import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Report = {
  id: string
  reason: string
  details: string | null
  status: string
  reviewerNote: string | null
  user: { id: string; username: string; role: string; banned: boolean }
  reporter: { id: string; username: string }
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("GET /user-reports", () => {
  test("lists the pending reports oldest first, with the reported user and the reporter", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const reported = await signInAs(services)
    const firstReporter = await signInAs(services)
    const secondReporter = await signInAs(services)
    const { id: older } = await services.db
      .insertInto("userReports")
      .values({
        userId: reported.userId,
        reporterId: firstReporter.userId,
        reason: "IMPERSONATION",
        details: "They pretend to be a staff member.",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      })
      .returning("id")
      .executeTakeFirstOrThrow()
    const { id: newer } = await services.db
      .insertInto("userReports")
      .values({
        userId: reported.userId,
        reporterId: secondReporter.userId,
        reason: "SPAM",
        createdAt: new Date("2026-02-01T00:00:00Z"),
      })
      .returning("id")
      .executeTakeFirstOrThrow()
    const { id: dismissed } = await services.db
      .insertInto("userReports")
      .values({
        userId: reported.userId,
        reporterId: firstReporter.userId,
        reason: "SPAM",
        status: "DISMISSED",
      })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api<Report[]>(app, "/user-reports?perPage=100", { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const ids = res.body.data.map((item) => item.id)

    expect(ids.indexOf(older)).toBeLessThan(ids.indexOf(newer))
    expect(ids).not.toContain(dismissed)
    expect(res.body.data.find((item) => item.id === older)).toMatchObject({
      reason: "IMPERSONATION",
      details: "They pretend to be a staff member.",
      status: "PENDING",
      reviewerNote: null,
      user: { id: reported.userId, role: "USER", banned: false },
      reporter: { id: firstReporter.userId },
    })
  })

  test("filters by status and reason", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const reported = await signInAs(services)
    const reporter = await signInAs(services)
    const other = await signInAs(services)
    const { id: harassment } = await services.db
      .insertInto("userReports")
      .values({
        userId: reported.userId,
        reporterId: reporter.userId,
        reason: "HARASSMENT",
        status: "RESOLVED",
        reviewerNote: "Removed the about text.",
      })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("userReports")
      .values({
        userId: reported.userId,
        reporterId: other.userId,
        reason: "SPAM",
        status: "RESOLVED",
      })
      .execute()

    const res = await api<Report[]>(
      app,
      "/user-reports?status=RESOLVED&reason=HARASSMENT&perPage=100",
      { headers },
    )

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.every((item) => item.reason === "HARASSMENT")).toBe(true)
    expect(res.body.data.every((item) => item.status === "RESOLVED")).toBe(true)
    expect(res.body.data.find((item) => item.id === harassment)?.reviewerNote).toBe(
      "Removed the about text.",
    )
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/user-reports"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })

    expectFailure(await api(app, "/user-reports", { headers }), 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await api(app, "/user-reports", { headers }), 403, "FORBIDDEN")
  })

  test("rejects an unknown status with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })

    expectFailure(await api(app, "/user-reports?status=OPEN", { headers }), 422, "VALIDATION_ERROR")
  })
})
