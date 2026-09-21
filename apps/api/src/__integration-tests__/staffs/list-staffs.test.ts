import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

type StaffListItem = { id: string; name: string; image: string | null }

describe("GET /staffs", () => {
  test("returns a paginated list of staffs", async ({ app }) => {
    const res = await api<StaffListItem[]>(app, `/staffs?page=1&perPage=50`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.meta?.total).toBeGreaterThan(0)
    expect(res.body.data.some((s) => s.name === "Kodachi Ukyou")).toBe(true)
  })

  test("returns VALIDATION_ERROR for an out-of-range perPage", async ({ app }) => {
    const res = await api(app, `/staffs?perPage=999`)

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
