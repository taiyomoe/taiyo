import { describe, expect } from "vitest"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"
const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

type Item = { groupId: string; name: string; logo: string | null }

describe("GET /chapters/:id/groups", () => {
  test("returns the groups linked to a chapter", async ({ app }) => {
    const res = await api<Item[]>(app, `/chapters/${SEEDED_CHAPTER_ID}/groups`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.some((g) => g.groupId === SEEDED_GROUP_ID)).toBe(true)
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app }) => {
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000/groups`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })
})
