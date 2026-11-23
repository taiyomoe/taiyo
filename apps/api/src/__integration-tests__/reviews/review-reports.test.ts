import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { failure, reviewer } from "./helpers"

type ReportedReview = {
  reportId: string
  review: { id: string; deletedAt: string | null; deletedByAuthor: boolean }
  reports: Array<{ reason: string; details: string | null; reporter: { id: string } }>
  reportCount: number
}

const report = (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  reviewId: string,
  json: unknown = { reason: "SPOILER" },
) => api<{ id: string }>(app, `/reviews/${reviewId}/reports`, { method: "POST", headers, json })
const queue = async (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  query = "",
) => {
  const res = await api<ReportedReview[]>(app, `/review-reports${query}`, { headers })

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}

describe("POST /reviews/:id/reports", () => {
  test("reports a review once while the report is open", async ({ app, services }) => {
    const { review } = await reviewer(app, services)
    const { headers } = await signInAs(services)

    expect(
      (await report(app, headers, review.id, { reason: "SPOILER", details: "  Ending.  " })).status,
    ).toBe(201)
    expect(failure(await report(app, headers, review.id))).toEqual({
      status: 409,
      code: "REVIEW_REPORT_EXISTS",
    })
  })

  test("refuses reporting your own review", async ({ app, services }) => {
    const author = await reviewer(app, services)

    expect(failure(await report(app, author.headers, author.review.id))).toEqual({
      status: 403,
      code: "FORBIDDEN",
    })
  })
})

describe("the review report queue", () => {
  test("groups reports per review, and closes them all at once", async ({ app, services }) => {
    const { review } = await reviewer(app, services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const reporters = [await signInAs(services), await signInAs(services)]

    for (const { headers } of reporters) {
      await report(app, headers, review.id, { reason: "HARASSMENT", details: "Rude." })
    }

    const entry = (await queue(app, moderator.headers)).find((item) => item.review.id === review.id)

    expect(entry).toMatchObject({ reportCount: 2, review: { deletedAt: null } })
    expect(entry?.reports.map((item) => item.reason)).toEqual(["HARASSMENT", "HARASSMENT"])

    const close = await api<{ closed: number }>(app, `/review-reports/${entry?.reportId}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })

    expect(close.body).toMatchObject({ success: true, data: { closed: 2 } })
    expect(
      failure(
        await api(app, `/review-reports/${entry?.reportId}`, {
          method: "PATCH",
          headers: moderator.headers,
          json: { status: "DISMISSED" },
        }),
      ),
    ).toEqual({ status: 409, code: "REVIEW_REPORT_CLOSED" })
    expect(
      (await queue(app, moderator.headers, "?status=DISMISSED")).some(
        (item) => item.review.id === review.id,
      ),
    ).toBe(true)
  })

  test("closes reports in bulk and skips the closed ones", async ({ app, services }) => {
    const first = await reviewer(app, services)
    const second = await reviewer(app, services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const { headers } = await signInAs(services)
    const ids = [
      await report(app, headers, first.review.id),
      await report(app, headers, second.review.id),
    ].map((res) => (res.body.success ? res.body.data.id : ""))
    const close = () =>
      api<{ done: string[]; skipped: Array<{ id: string; reason: string }> }>(
        app,
        "/review-reports",
        {
          method: "PATCH",
          headers: moderator.headers,
          json: { reportIds: ids, status: "RESOLVED" },
        },
      )

    expect((await close()).body).toMatchObject({ data: { done: ids, skipped: [] } })
    expect((await close()).body).toMatchObject({
      data: { done: [], skipped: ids.map((id) => ({ id, reason: "CLOSED" })) },
    })
  })

  test("is for moderators only", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    expect((await api(app, "/review-reports", { headers })).status).toBe(403)
    expect((await api(app, "/review-reports")).status).toBe(401)
  })
})

describe("DELETE /reviews/:id", () => {
  test("removes a review, resolves its reports, and keeps it in the queue", async ({
    app,
    services,
  }) => {
    const author = await reviewer(app, services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const { headers } = await signInAs(services)

    await report(app, headers, author.review.id)

    const res = await api<{ resolvedReports: number }>(app, `/reviews/${author.review.id}`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    expect(res.body).toMatchObject({ success: true, data: { resolvedReports: 1 } })

    const resolved = (await queue(app, moderator.headers, "?status=RESOLVED")).find(
      (item) => item.review.id === author.review.id,
    )

    expect(resolved?.review.deletedAt).not.toBeNull()
    expect(resolved?.review.deletedByAuthor).toBe(false)
    expect(
      (await findAuditLogs(services, "review.REMOVE")).some(
        (log) => log.targetId === author.review.id && log.actorId === moderator.userId,
      ),
    ).toBe(true)
    expect(
      failure(
        await api(app, `/reviews/${author.review.id}`, {
          method: "DELETE",
          headers: moderator.headers,
        }),
      ),
    ).toEqual({ status: 404, code: "REVIEW_NOT_FOUND" })
    expect(
      (await api(app, `/medias/${author.review.mediaId}/review`, { headers: author.headers })).body,
    ).toMatchObject({ data: null })
  })

  test("is for moderators only", async ({ app, services }) => {
    const author = await reviewer(app, services)
    const { headers } = await signInAs(services)

    expect(
      (await api(app, `/reviews/${author.review.id}`, { method: "DELETE", headers })).status,
    ).toBe(403)
    expect(
      (
        await api(app, `/reviews/${author.review.id}`, {
          method: "DELETE",
          headers: author.headers,
        })
      ).status,
    ).toBe(403)
  })
})
