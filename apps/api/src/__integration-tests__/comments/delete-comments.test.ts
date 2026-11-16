import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { postComment } from "./helpers"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /comments", () => {
  test("deletes the comments, resolves their reports and skips the missing ones", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const reporter = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const someone = await postComment(app, author.headers, target, "Spam spam spam")
    const own = await postComment(app, moderator.headers, target, "Moderator note")
    const removed = await postComment(app, author.headers, target, "Already gone")
    const missing = randomUUID()

    for (const commentId of [someone.id, own.id]) {
      await api(app, `/comments/${commentId}/reports`, {
        method: "POST",
        headers: reporter.headers,
        json: { reason: "SPAM" },
      })
    }

    await api(app, `/comments/${removed.id}`, { method: "DELETE", headers: author.headers })

    const res = await api<BulkResult>(app, "/comments", {
      method: "DELETE",
      headers: moderator.headers,
      json: { commentIds: [someone.id, own.id, removed.id, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [someone.id, own.id],
      skipped: [
        { id: removed.id, reason: "NOT_FOUND" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const comments = await services.db
      .selectFrom("comments")
      .select(["id", "deletion", "deleterId", "deletedAt"])
      .where("id", "in", [someone.id, own.id, removed.id])
      .execute()
    const byId = new Map(comments.map((comment) => [comment.id, comment]))

    expect(byId.get(someone.id)).toMatchObject({
      deletion: "MODERATOR",
      deleterId: moderator.userId,
    })
    expect(byId.get(own.id)).toMatchObject({ deletion: "AUTHOR", deleterId: moderator.userId })
    expect(byId.get(removed.id)).toMatchObject({ deletion: "AUTHOR", deleterId: author.userId })

    const reports = await services.db
      .selectFrom("commentReports")
      .select(["commentId", "status", "resolverId"])
      .where("commentId", "in", [someone.id, own.id])
      .execute()

    expect(reports.find((report) => report.commentId === someone.id)).toMatchObject({
      status: "RESOLVED",
      resolverId: moderator.userId,
    })
    expect(reports.find((report) => report.commentId === own.id)).toMatchObject({
      status: "OPEN",
      resolverId: null,
    })

    const [log] = await findAuditLogs(services, "comment.DELETE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { commentIds: [someone.id, own.id] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/comments", {
      method: "DELETE",
      json: { commentIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/comments", {
      method: "DELETE",
      headers,
      json: { commentIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects authors without the moderator role with FORBIDDEN", async ({ app, services }) => {
    const author = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target)
    const res = await api(app, "/comments", {
      method: "DELETE",
      headers: author.headers,
      json: { commentIds: [comment.id] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/comments", { method: "DELETE", headers, json: { commentIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
