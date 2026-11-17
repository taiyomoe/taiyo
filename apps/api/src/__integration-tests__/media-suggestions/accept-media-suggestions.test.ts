import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedStaff } from "../helpers/seed"
import { test } from "../setup"
import { type BulkResult, expectFailure, getMedia, getReviewer, getSuggestionId } from "./helpers"

describe("POST /media-suggestions/accept", () => {
  test("applies every suggested field and skips what no longer applies", async ({
    app,
    services,
  }) => {
    const reviewer = await getReviewer(services)
    const author = await signInAs(services)
    const other = await signInAs(services)
    const mediaId = await getMedia(services, reviewer.userId)
    const otherMediaId = await getMedia(services, reviewer.userId)
    const accepted = await getSuggestionId(app, mediaId, author.headers, {
      type: "MANHWA",
      titles: [
        { title: "Main", language: "en", isMainTitle: true },
        { title: "Alt", language: "en" },
      ],
    })
    const changedSince = await getSuggestionId(app, mediaId, other.headers, {
      synopsis: { en: "Suggested synopsis." },
    })
    const rejected = await getSuggestionId(app, otherMediaId, author.headers, {
      status: "FINISHED",
    })
    const staffId = await seedStaff(services, reviewer.userId, "Writer")
    const deletedStaff = await getSuggestionId(app, otherMediaId, other.headers, {
      staffs: [{ staffId, role: "AUTHOR" }],
    })
    const missing = randomUUID()

    await api(app, `/medias/${mediaId}`, {
      method: "PATCH",
      headers: reviewer.headers,
      json: { synopsis: { en: "Edited by staff." } },
    })
    await api(app, `/media-suggestions/${rejected}/reject`, {
      method: "POST",
      headers: reviewer.headers,
      json: { note: "No." },
    })
    await services.db
      .updateTable("staffs")
      .set({ deletedAt: new Date() })
      .where("id", "=", staffId)
      .execute()

    const res = await api<BulkResult>(app, "/media-suggestions/accept", {
      method: "POST",
      headers: reviewer.headers,
      json: {
        suggestionIds: [accepted, changedSince, rejected, deletedStaff, missing],
        note: "Thanks!",
      },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.done).toEqual([accepted])
    expect(res.body.data.skipped).toHaveLength(4)
    expect(res.body.data.skipped).toEqual(
      expect.arrayContaining([
        { id: changedSince, reason: "CONFLICT" },
        { id: rejected, reason: "NOT_PENDING" },
        { id: deletedStaff, reason: "CONFLICT" },
        { id: missing, reason: "NOT_FOUND" },
      ]),
    )

    const media = await services.db
      .selectFrom("medias")
      .select(["type", "synopsis"])
      .where("id", "=", mediaId)
      .executeTakeFirstOrThrow()
    const alt = await services.db
      .selectFrom("titles")
      .select("creatorId")
      .where("mediaId", "=", mediaId)
      .where("title", "=", "Alt")
      .executeTakeFirstOrThrow()
    const rows = await services.db
      .selectFrom("mediaSuggestions")
      .select(["id", "status", "acceptedFields", "reviewerId", "reviewerNote"])
      .where("id", "in", [accepted, changedSince, deletedStaff])
      .execute()
    const byId = new Map(rows.map((row) => [row.id, row]))

    expect(media).toEqual({ type: "MANHWA", synopsis: { en: "Edited by staff." } })
    expect(alt.creatorId).toBe(author.userId)
    expect(byId.get(accepted)).toMatchObject({
      status: "ACCEPTED",
      acceptedFields: ["titles", "type"],
      reviewerId: reviewer.userId,
      reviewerNote: "Thanks!",
    })
    expect(byId.get(changedSince)).toMatchObject({ status: "PENDING", reviewerId: null })
    expect(byId.get(deletedStaff)).toMatchObject({ status: "PENDING", reviewerId: null })

    const [log] = await findAuditLogs(services, "media.suggestion.ACCEPT_MANY")

    expect(log?.event).toMatchObject({
      audit: { reason: "Thanks!", changes: { after: { suggestionIds: [accepted] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/media-suggestions/accept", {
      method: "POST",
      json: { suggestionIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/media-suggestions/accept", {
      method: "POST",
      headers,
      json: { suggestionIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects users who cannot review with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/media-suggestions/accept", {
      method: "POST",
      headers,
      json: { suggestionIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an invalid ID with VALIDATION_ERROR", async ({ app, services }) => {
    const reviewer = await getReviewer(services)
    const res = await api(app, "/media-suggestions/accept", {
      method: "POST",
      headers: reviewer.headers,
      json: { suggestionIds: ["not-a-uuid"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
