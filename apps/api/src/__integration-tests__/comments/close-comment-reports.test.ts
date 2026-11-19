import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { expectSuccess, postComment } from "./helpers"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /comment-reports", () => {
  test("closes every open report on the comments and skips the others", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const reporters = await Promise.all([signInAs(services), signInAs(services)])
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const twice = await postComment(app, author.headers, target, "Reported twice")
    const once = await postComment(app, author.headers, target, "Reported once")
    const closed = await postComment(app, author.headers, target, "Already dismissed")
    const report = async (commentId: string, headers: Record<string, string>) =>
      expectSuccess(
        await api<{ id: string }>(app, `/comments/${commentId}/reports`, {
          method: "POST",
          headers,
          json: { reason: "SPAM" },
        }),
      ).id
    const first = await report(twice.id, reporters[0].headers)
    const second = await report(twice.id, reporters[1].headers)
    const single = await report(once.id, reporters[0].headers)
    const dismissed = await report(closed.id, reporters[0].headers)
    const missing = randomUUID()

    await api(app, `/comment-reports/${dismissed}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })

    const res = await api<BulkResult>(app, "/comment-reports", {
      method: "PATCH",
      headers: moderator.headers,
      json: { reportIds: [first, single, dismissed, missing], status: "RESOLVED" },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, single],
      skipped: [
        { id: dismissed, reason: "CLOSED" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const reports = await services.db
      .selectFrom("commentReports")
      .select(["id", "status", "resolverId"])
      .where("id", "in", [first, second, single, dismissed])
      .execute()

    expect(Object.fromEntries(reports.map((row) => [row.id, row.status]))).toEqual({
      [first]: "RESOLVED",
      [second]: "RESOLVED",
      [single]: "RESOLVED",
      [dismissed]: "DISMISSED",
    })
    expect(
      reports
        .filter((row) => row.id !== dismissed)
        .every((row) => row.resolverId === moderator.userId),
    ).toBe(true)

    const [log] = await findAuditLogs(services, "comment.report.CLOSE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { commentIds: [twice.id, once.id], status: "RESOLVED" } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/comment-reports", {
      method: "PATCH",
      json: { reportIds: [randomUUID()], status: "DISMISSED" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const res = await api(app, "/comment-reports", {
      method: "PATCH",
      headers,
      json: { reportIds: [randomUUID()], status: "DISMISSED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects users without the moderator role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const res = await api(app, "/comment-reports", {
      method: "PATCH",
      headers,
      json: { reportIds: [randomUUID()], status: "DISMISSED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an unknown status with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/comment-reports", {
      method: "PATCH",
      headers,
      json: { reportIds: [randomUUID()], status: "OPEN" },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
