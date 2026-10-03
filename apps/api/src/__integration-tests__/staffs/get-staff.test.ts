import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_STAFF_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2" // Kodachi Ukyou

type StaffDetail = {
  id: string
  name: string
  bio: Record<string, string>
  links: Record<string, string>
  image: string | null
  createdAt: string
  updatedAt: string
}

describe("GET /staffs/:id", () => {
  test("returns the staff detail", async ({ app }) => {
    const res = await api<StaffDetail>(app, `/staffs/${SEEDED_STAFF_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_STAFF_ID)
    expect(res.body.data.name).toBe("Kodachi Ukyou")
  })

  test("returns STAFF_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/staffs/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("STAFF_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/staffs/not-a-uuid`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
