import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"
import { type BulkResult, expectFailure, getMedia, getReviewer, getSuggestionId } from "./helpers"

describe("POST /media-suggestions/reject", () => {
  test("rejects the pending suggestions with one note and skips the others", async ({
    app,
    services,
  }) => {
    const reviewer = await getReviewer(services)
    const author = await signInAs(services)
    const other = await signInAs(services)
    const mediaId = await getMedia(services, reviewer.userId)
    const first = await getSuggestionId(app, mediaId, author.headers, { type: "MANHWA" })
    const second = await getSuggestionId(app, mediaId, other.headers, { status: "FINISHED" })
    const withdrawn = await getSuggestionId(
      app,
      await getMedia(services, reviewer.userId),
      author.headers,
      { type: "MANHUA" },
    )
    const missing = randomUUID()

    await api(app, `/media-suggestions/${withdrawn}/withdraw`, {
      method: "POST",
      headers: author.headers,
    })

    const res = await api<BulkResult>(app, "/media-suggestions/reject", {
      method: "POST",
      headers: reviewer.headers,
      json: { suggestionIds: [first, second, withdrawn, missing], note: "No sources." },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: withdrawn, reason: "NOT_PENDING" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const rows = await services.db
      .selectFrom("mediaSuggestions")
      .select(["id", "status", "reviewerId", "reviewerNote"])
      .where("id", "in", [first, second, withdrawn])
      .execute()
    const byId = new Map(rows.map((row) => [row.id, row]))

    for (const id of [first, second]) {
      expect(byId.get(id)).toMatchObject({
        status: "REJECTED",
        reviewerId: reviewer.userId,
        reviewerNote: "No sources.",
      })
    }

    expect(byId.get(withdrawn)).toMatchObject({ status: "WITHDRAWN", reviewerId: null })

    const media = await services.db
      .selectFrom("medias")
      .select(["type", "status"])
      .where("id", "=", mediaId)
      .executeTakeFirstOrThrow()

    expect(media.type).toBe("MANGA")
    expect(media.status).toBe("RELEASING")

    const [log] = await findAuditLogs(services, "media.suggestion.REJECT_MANY")

    expect(log?.event).toMatchObject({
      audit: { reason: "No sources.", changes: { after: { suggestionIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/media-suggestions/reject", {
      method: "POST",
      json: { suggestionIds: [randomUUID()], note: "No." },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/media-suggestions/reject", {
      method: "POST",
      headers,
      json: { suggestionIds: [randomUUID()], note: "No." },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects users who cannot review with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER_INTERN" })
    const res = await api(app, "/media-suggestions/reject", {
      method: "POST",
      headers,
      json: { suggestionIds: [randomUUID()], note: "No." },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a blank note with VALIDATION_ERROR", async ({ app, services }) => {
    const reviewer = await getReviewer(services)
    const res = await api(app, "/media-suggestions/reject", {
      method: "POST",
      headers: reviewer.headers,
      json: { suggestionIds: [randomUUID()], note: " " },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
