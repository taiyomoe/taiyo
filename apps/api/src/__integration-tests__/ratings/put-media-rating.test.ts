import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type RatingResult = {
  mediaId: string
  score: number | null
  rating: { count: number; average: number | null }
}

const getStats = ({ db }: Services, mediaId: string) =>
  db
    .selectFrom("mediaRatingStats")
    .select(["ratingCount", "ratingSum", "scoreCounts"])
    .where("mediaId", "=", mediaId)
    .executeTakeFirst()
const rate = (app: Parameters<typeof api>[0], headers: Record<string, string>, score: unknown) =>
  api<RatingResult>(app, `/medias/${SEEDED_MEDIA_ID}/rating`, {
    method: "PUT",
    headers,
    json: { score },
  })
const scoreCountsWith = (counts: Record<number, number>) =>
  Array.from({ length: 10 }, (_, index) => counts[index + 1] ?? 0)

describe("PUT /medias/:id/rating", () => {
  test("rates a media and updates its totals", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await rate(app, headers, 8)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      mediaId: SEEDED_MEDIA_ID,
      score: 8,
      rating: { count: 1, average: 8 },
    })

    const row = await services.db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirst()

    expect(row?.score).toBe(8)
    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 1,
      ratingSum: 8,
      scoreCounts: scoreCountsWith({ 8: 1 }),
    })
  })

  test("changes a score without counting the rating twice", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const other = await signInAs(services)

    await rate(app, other.headers, 4)
    await rate(app, headers, 8)
    await rate(app, headers, 3)

    const res = await rate(app, headers, 3)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.rating).toEqual({ count: 2, average: 3.5 })
    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 2,
      ratingSum: 7,
      scoreCounts: scoreCountsWith({ 3: 1, 4: 1 }),
    })
  })

  test("does not add the media to the library", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 6)

    const entry = await services.db
      .selectFrom("userLibraryEntries")
      .select("status")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirst()

    expect(entry).toBeUndefined()
  })

  test("keeps exact totals under 20 parallel ratings", async ({ app, services }) => {
    const raters = await Promise.all(Array.from({ length: 20 }, () => signInAs(services)))
    const scores = raters.map((_, index) => (index % 10) + 1)
    const results = await Promise.all(
      raters.map(({ headers }, index) => rate(app, headers, scores[index])),
    )

    expect(results.every((res) => res.status === 200)).toBe(true)
    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 20,
      ratingSum: scores.reduce((sum, score) => sum + score, 0),
      scoreCounts: scoreCountsWith(Object.fromEntries(scores.map((score) => [score, 2]))),
    })
  })

  test("keeps one rating when the same user rates in parallel", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, index) => rate(app, headers, (index % 10) + 1)),
    )

    expect(results.every((res) => res.status === 200)).toBe(true)

    const row = await services.db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirstOrThrow()

    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 1,
      ratingSum: row.score,
      scoreCounts: scoreCountsWith({ [row.score]: 1 }),
    })
  })

  test("records the change in the audit log", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await rate(app, headers, 5)
    await rate(app, headers, 9)

    const logs = await findAuditLogs(services, "rating.SET")

    expect(logs.filter((log) => log.actorId === userId)).toHaveLength(2)
    expect(logs.at(-1)?.targetId).toBe(SEEDED_MEDIA_ID)
  })

  test("returns MEDIA_NOT_FOUND for a soft-deleted media", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    const res = await api(app, `/medias/${mediaId}/rating`, {
      method: "PUT",
      headers,
      json: { score: 7 },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns MEDIA_NOT_FOUND for a media your content ratings hide", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId, "NSFW")
    const res = await api(app, `/medias/${mediaId}/rating`, {
      method: "PUT",
      headers,
      json: { score: 7 },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")

    await services.db
      .updateTable("users")
      .set({ settings: { contentRating: ["NORMAL", "SUGGESTIVE", "NSFW"] } })
      .where("id", "=", userId)
      .execute()

    const allowed = await api(app, `/medias/${mediaId}/rating`, {
      method: "PUT",
      headers,
      json: { score: 7 },
    })

    expect(allowed.status).toBe(200)
  })

  test("returns MEDIA_LOCKED for a locked media", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ flag: "LOCKED" })
      .where("id", "=", mediaId)
      .execute()

    const res = await api(app, `/medias/${mediaId}/rating`, {
      method: "PUT",
      headers,
      json: { score: 7 },
    })

    expect(res.status).toBe(451)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_LOCKED")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/medias/${randomUUID()}/rating`, {
      method: "PUT",
      headers,
      json: { score: 7 },
    })

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for a score out of range", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    for (const score of [0, 11, 7.5, "8"]) {
      const res = await rate(app, headers, score)

      expect(res.status).toBe(422)
    }

    expect(await getStats(services, SEEDED_MEDIA_ID)).toBeUndefined()
  })

  test("returns UNAUTHORIZED when signed out", async ({ app }) => {
    const res = await rate(app, {}, 7)

    expect(res.status).toBe(401)
  })

  test("returns FORBIDDEN for a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await rate(app, headers, 7)

    expect(res.status).toBe(403)
  })

  test("returns RATE_LIMITED after 30 writes in a minute", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    for (let i = 0; i < 30; i++) {
      expect((await rate(app, headers, (i % 10) + 1)).status).toBe(200)
    }

    const blocked = await rate(app, headers, 5)

    expect(blocked.status).toBe(429)

    if (blocked.body.success) {
      throw new Error("Expected failure")
    }

    expect(blocked.body.code).toBe("RATE_LIMITED")
  }, 30_000)
})
