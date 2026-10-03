import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

type GroupItem = { id: string; name: string; logo: string | null }

describe("GET /groups", () => {
  test("returns a paginated list of groups", async ({ app }) => {
    const res = await api<GroupItem[]>(app, `/groups?perPage=100`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data.some((g) => g.name === "scansPROJECT")).toBe(true)
  })

  test("returns VALIDATION_ERROR for an out-of-range perPage", async ({ app }) => {
    const res = await api(app, `/groups?perPage=999`)

    expect(res.status).toBe(422)
  })
})
