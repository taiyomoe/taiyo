import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

// Boruto, seeded in packages/db/src/seeds/medias/media-1.ts
const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

type CoverRow = {
  id: string
  volume: string | null
  language: string
  contentRating: string
  isMainCover: boolean
}

describe("GET /medias/:id/covers", () => {
  test("returns the covers of a media", async ({ app }) => {
    const res = await api<CoverRow[]>(app, `/medias/${SEEDED_MEDIA_ID}/covers`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.some((c) => c.isMainCover === true)).toBe(true)
  })

  test("returns MEDIA_NOT_FOUND for an unknown media id", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/covers`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid/covers`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
