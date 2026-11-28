import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

type MediaStats = {
  rating: {
    count: number
    average: number | null
    distribution: Array<{ score: number; count: number }>
  }
  library: { total: number; byStatus: Record<string, number> }
}

describe("GET /medias/:id/stats", () => {
  test("returns the rating and library stats of the media", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const raters = await Promise.all([signInAs(services), signInAs(services), signInAs(services)])

    for (const [index, { headers }] of raters.entries()) {
      await api(app, `/medias/${mediaId}/rating`, {
        method: "PUT",
        headers,
        json: { score: [10, 10, 7][index] },
      })
    }

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId: raters[0].userId, mediaId, status: "READING" },
        { userId: raters[1].userId, mediaId, status: "READING" },
        { userId, mediaId, status: "DROPPED" },
      ])
      .execute()

    const res = await api<MediaStats>(app, `/medias/${mediaId}/stats`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.rating.count).toBe(3)
    expect(res.body.data.rating.average).toBe(9)
    expect(res.body.data.rating.distribution).toHaveLength(10)
    expect(res.body.data.rating.distribution.find((row) => row.score === 10)?.count).toBe(2)
    expect(res.body.data.rating.distribution.find((row) => row.score === 7)?.count).toBe(1)
    expect(res.body.data.library).toEqual({
      total: 3,
      byStatus: {
        READING: 2,
        REREADING: 0,
        PLAN_TO_READ: 0,
        COMPLETED: 0,
        ON_HOLD: 0,
        DROPPED: 1,
      },
    })
  })

  test("returns empty stats for a media nobody rated", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const res = await api<MediaStats>(app, `/medias/${mediaId}/stats`)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.rating.count).toBe(0)
    expect(res.body.data.rating.average).toBeNull()
    expect(res.body.data.rating.distribution.every((row) => row.count === 0)).toBe(true)
    expect(res.body.data.library.total).toBe(0)
  })

  test("returns MEDIA_NOT_FOUND outside the content ratings", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId, "NSFW")
    const hidden = await api(app, `/medias/${mediaId}/stats`)

    expect(hidden.status).toBe(404)

    if (hidden.body.success) {
      throw new Error("Expected failure")
    }

    expect(hidden.body.code).toBe("MEDIA_NOT_FOUND")

    const shown = await api(app, `/medias/${mediaId}/stats?contentRating=NORMAL,NSFW`)

    expect(shown.status).toBe(200)
  })

  test("returns MEDIA_NOT_FOUND for a soft-deleted media", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    const res = await api(app, `/medias/${mediaId}/stats`)

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for an invalid content rating", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const res = await api(app, `/medias/${mediaId}/stats?contentRating=PG13`)

    expect(res.status).toBe(422)
  })
})
