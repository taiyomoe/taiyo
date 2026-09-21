import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

// Boruto, seeded in packages/db/src/seeds/medias/media-1.ts
const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("GET /medias/:id", () => {
  test("returns the media with its relations", async ({ app }) => {
    const res = await api<{ id: string; titles: unknown[]; covers: unknown[]; banners: unknown[] }>(
      app,
      `/medias/${SEEDED_MEDIA_ID}`,
    )

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_MEDIA_ID)
    expect(res.body.data.titles.length).toBeGreaterThan(0)
    expect(res.body.data.covers.length).toBeGreaterThan(0)
  })

  test("returns MEDIA_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/medias/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
