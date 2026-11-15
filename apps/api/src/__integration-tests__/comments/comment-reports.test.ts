import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { expectSuccess, postComment } from "./helpers"

type ReportedComment = {
  reportId: string
  reportCount: number
  comment: { id: string; removal: string | null; originalContent: string }
  target: { type: string; id: string; label: string | null }
}

describe("comment reports", () => {
  test("accepts one open report per user and refuses reporting yourself", async ({
    app,
    services,
  }) => {
    const author = await signInAs(services)
    const reporter = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target, "buy cheap stuff")
    const report = () =>
      api(app, `/comments/${comment.id}/reports`, {
        method: "POST",
        headers: reporter.headers,
        json: { reason: "SPAM", details: "link farm" },
      })

    expect((await report()).status).toBe(201)
    expect((await report()).body).toMatchObject({ code: "COMMENT_REPORT_EXISTS" })

    const self = await api(app, `/comments/${comment.id}/reports`, {
      method: "POST",
      headers: author.headers,
      json: { reason: "OTHER" },
    })

    expect(self.status).toBe(403)
  })

  test("groups reports per comment for moderators and resolves them on deletion", async ({
    app,
    services,
  }) => {
    const author = await signInAs(services)
    const reporters = await Promise.all([signInAs(services), signInAs(services)])
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const spam = await postComment(app, author.headers, target, "spam")
    const fine = await postComment(app, author.headers, target, "fine")

    for (const reporter of reporters) {
      await api(app, `/comments/${spam.id}/reports`, {
        method: "POST",
        headers: reporter.headers,
        json: { reason: "SPAM" },
      })
    }

    await api(app, `/comments/${fine.id}/reports`, {
      method: "POST",
      headers: reporters[0].headers,
      json: { reason: "HARASSMENT" },
    })

    const forbidden = await api(app, "/comment-reports", { headers: author.headers })

    expect(forbidden.status).toBe(403)

    const open = expectSuccess(
      await api<ReportedComment[]>(app, "/comment-reports", { headers: moderator.headers }),
    )

    expect(open.map((entry) => [entry.comment.id, entry.reportCount])).toEqual([
      [spam.id, 2],
      [fine.id, 1],
    ])
    expect(open[0]?.target).toMatchObject({ type: "MEDIA", id: target.id })

    await api(app, `/comments/${spam.id}`, { method: "DELETE", headers: moderator.headers })

    const fineEntry = open.find((entry) => entry.comment.id === fine.id)
    const dismissed = expectSuccess(
      await api<{ closed: number }>(app, `/comment-reports/${fineEntry?.reportId ?? ""}`, {
        method: "PATCH",
        headers: moderator.headers,
        json: { status: "DISMISSED" },
      }),
    )

    expect(dismissed.closed).toBe(1)

    const remaining = expectSuccess(
      await api<ReportedComment[]>(app, "/comment-reports", { headers: moderator.headers }),
    )

    expect(remaining).toEqual([])

    const resolved = expectSuccess(
      await api<ReportedComment[]>(app, "/comment-reports?status=RESOLVED", {
        headers: moderator.headers,
      }),
    )

    expect(resolved[0]?.comment).toMatchObject({
      id: spam.id,
      removal: "MODERATOR",
      originalContent: "spam",
    })
  })
})
