import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

type ChapterRow = {
  id: string
  number: number
  language: string
}

describe("GET /medias/:id/chapters", () => {
  test("returns the chapters of a media", async ({ app }) => {
    const res = await api<ChapterRow[]>(app, `/medias/${SEEDED_MEDIA_ID}/chapters?perPage=100`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.some((c) => c.id === SEEDED_CHAPTER_ID)).toBe(true)
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/chapters`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid/chapters`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
