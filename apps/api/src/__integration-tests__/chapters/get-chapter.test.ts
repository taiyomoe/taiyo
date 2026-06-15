import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

type ChapterDetail = {
  id: string
  mediaId: string
  number: number
  language: string
}

describe("GET /chapters/:id", () => {
  test("returns the chapter detail", async ({ app }) => {
    const res = await api<ChapterDetail>(app, `/chapters/${SEEDED_CHAPTER_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_CHAPTER_ID)
    expect(res.body.data.mediaId).toBe(SEEDED_MEDIA_ID)
  })

  test("returns CHAPTER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/chapters/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
