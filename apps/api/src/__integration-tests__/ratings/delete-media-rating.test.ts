import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const PATH = `/medias/${SEEDED_MEDIA_ID}/rating`

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

describe("DELETE /medias/:id/rating", () => {
  test("removes the rating and its share of the totals", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const other = await signInAs(services)

    await api(app, PATH, { method: "PUT", headers: other.headers, json: { score: 6 } })
    await api(app, PATH, { method: "PUT", headers, json: { score: 9 } })

    const res = await api<RatingResult>(app, PATH, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      mediaId: SEEDED_MEDIA_ID,
      score: null,
      rating: { count: 1, average: 6 },
    })

    const row = await services.db
      .selectFrom("mediaRatings")
      .select("score")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirst()

    expect(row).toBeUndefined()
    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 1,
      ratingSum: 6,
      scoreCounts: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    })
  })

  test("keeps the library entry", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })
    await api(app, PATH, { method: "PUT", headers, json: { score: 9 } })
    await api(app, PATH, { method: "DELETE", headers })

    const entry = await services.db
      .selectFrom("userLibraryEntries")
      .select("status")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirst()

    expect(entry?.status).toBe("READING")
  })

  test("removes the rating once when deleted in parallel", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    await api(app, PATH, { method: "PUT", headers, json: { score: 9 } })

    const results = await Promise.all(
      Array.from({ length: 5 }, () => api(app, PATH, { method: "DELETE", headers })),
    )

    expect(results.filter((res) => res.status === 200)).toHaveLength(1)
    expect(results.filter((res) => res.status === 404)).toHaveLength(4)
    expect(await getStats(services, SEEDED_MEDIA_ID)).toEqual({
      ratingCount: 0,
      ratingSum: 0,
      scoreCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    })
  })

  test("returns RATING_NOT_FOUND when you have not rated the media", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, PATH, { method: "DELETE", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("RATING_NOT_FOUND")
  })

  test("returns MEDIA_NOT_FOUND for a media your content ratings hide", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId, "NSFL")
    const res = await api(app, `/medias/${mediaId}/rating`, { method: "DELETE", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid ID", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/medias/not-a-uuid/rating", { method: "DELETE", headers })

    expect(res.status).toBe(422)
  })

  test("returns UNAUTHORIZED when signed out", async ({ app }) => {
    const res = await api(app, PATH, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns FORBIDDEN for a banned user", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, PATH, { method: "DELETE", headers })

    expect(res.status).toBe(403)
  })
})
