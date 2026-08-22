import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type BannerDetail = {
  id: string
  mediaId: string
  contentRating: string
  createdAt: string
  updatedAt: string
}

describe("GET /banners/:id", () => {
  test("returns the banner detail", async ({ app, services }) => {
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

    const res = await api<BannerDetail>(app, `/banners/${bannerId}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(bannerId)
    expect(res.body.data.mediaId).toBe(SEEDED_MEDIA_ID)
    expect(res.body.data.contentRating).toBe("NORMAL")
  })

  test("returns BANNER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/banners/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("BANNER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/banners/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
