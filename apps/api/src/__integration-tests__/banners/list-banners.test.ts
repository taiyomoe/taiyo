import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type BannerRow = {
  id: string
  contentRating: string
}

describe("GET /medias/:id/banners", () => {
  test("returns the banners of a media", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = randomUUID()

    await services.db
      .insertInto("banners")
      .values({
        id: bannerId,
        mediaId: SEEDED_MEDIA_ID,
        uploaderId: userId,
        contentRating: "NORMAL",
      })
      .execute()

    const res = await api<BannerRow[]>(app, `/medias/${SEEDED_MEDIA_ID}/banners`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.some((b) => b.id === bannerId)).toBe(true)
  })

  test("returns MEDIA_NOT_FOUND for an unknown media id", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/banners`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid/banners`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
