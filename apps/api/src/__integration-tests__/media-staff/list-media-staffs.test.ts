import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_STAFF_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2" // Kodachi, AUTHOR

type LinkItem = { staffId: string; name: string; image: string | null; role: string }

describe("GET /medias/:id/staffs", () => {
  test("returns the staff linked to a media", async ({ app }) => {
    const res = await api<LinkItem[]>(app, `/medias/${SEEDED_MEDIA_ID}/staffs`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.some((s) => s.staffId === SEEDED_STAFF_ID && s.role === "AUTHOR")).toBe(
      true,
    )
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app }) => {
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/staffs`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })
})
