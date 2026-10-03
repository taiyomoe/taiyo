import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MAIN_COVER_ID = "a56cc54d-7776-4787-9b21-97a4674b80bc"

type CoverDetail = {
  id: string
  mediaId: string
  volume: string | null
  language: string
  contentRating: string
  isMainCover: boolean
  createdAt: string
  updatedAt: string
}

describe("GET /covers/:id", () => {
  test("returns the cover detail", async ({ app }) => {
    const res = await api<CoverDetail>(app, `/covers/${SEEDED_MAIN_COVER_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_MAIN_COVER_ID)
    expect(res.body.data.mediaId).toBe(SEEDED_MEDIA_ID)
    expect(res.body.data.isMainCover).toBe(true)
  })

  test("returns COVER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/covers/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COVER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/covers/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
