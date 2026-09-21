import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1" // scansPROJECT

type GroupDetail = { id: string; name: string }

describe("GET /groups/:id", () => {
  test("returns the group detail", async ({ app }) => {
    const res = await api<GroupDetail>(app, `/groups/${SEEDED_GROUP_ID}`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_GROUP_ID)
    expect(res.body.data.name).toBe("scansPROJECT")
  })

  test("returns GROUP_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/groups/00000000-0000-0000-0000-000000000000`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("GROUP_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app }) => {
    const res = await api(app, `/groups/not-a-uuid`)

    expect(res.status).toBe(422)
  })
})
