import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { type BulkResult, expectFailure, getMedia, getReviewer, getSuggestionId } from "./helpers"

describe("POST /media-suggestions/withdraw", () => {
  test("withdraws your pending suggestions and skips the others", async ({ app, services }) => {
    const reviewer = await getReviewer(services)
    const author = await signInAs(services)
    const other = await signInAs(services)
    const mediaId = await getMedia(services, reviewer.userId)
    const first = await getSuggestionId(app, mediaId, author.headers, { type: "MANHWA" })
    const second = await getSuggestionId(
      app,
      await getMedia(services, reviewer.userId),
      author.headers,
      { status: "FINISHED" },
    )
    const rejected = await getSuggestionId(
      app,
      await getMedia(services, reviewer.userId),
      author.headers,
      { type: "MANHUA" },
    )
    const someoneElses = await getSuggestionId(app, mediaId, other.headers, { type: "OTHER" })

    await api(app, `/media-suggestions/${rejected}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { note: "No." },
    })

    const res = await api<BulkResult>(app, "/media-suggestions/withdraw", {
      method: "POST",
      headers: author.headers,
      json: { suggestionIds: [first, second, rejected, someoneElses] },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: rejected, reason: "NOT_PENDING" },
        { id: someoneElses, reason: "NOT_FOUND" },
      ],
    })

    const rows = await services.db
      .selectFrom("mediaSuggestions")
      .select(["id", "status"])
      .where("id", "in", [first, second, rejected, someoneElses])
      .execute()

    expect(Object.fromEntries(rows.map((row) => [row.id, row.status]))).toEqual({
      [first]: "WITHDRAWN",
      [second]: "WITHDRAWN",
      [rejected]: "REJECTED",
      [someoneElses]: "PENDING",
    })

    const [log] = await findAuditLogs(services, "media.suggestion.WITHDRAW_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { suggestionIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/media-suggestions/withdraw", {
      method: "POST",
      json: { suggestionIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/media-suggestions/withdraw", {
      method: "POST",
      headers,
      json: { suggestionIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/media-suggestions/withdraw", {
      method: "POST",
      headers,
      json: { suggestionIds: [] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
