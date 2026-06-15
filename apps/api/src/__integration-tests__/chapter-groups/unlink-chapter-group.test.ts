import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"
const SEEDED_GROUP_ID = "4d8a22ba-d8a0-4a98-b4f3-1d630fbd7de1"

describe("DELETE /chapters/:id/groups/:groupId", () => {
  test("unlinks a group from a chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups/${SEEDED_GROUP_ID}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .where("groupId", "=", SEEDED_GROUP_ID)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns CHAPTER_GROUP_NOT_FOUND when link does not exist", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups/${randomUUID()}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_GROUP_NOT_FOUND")
  })

  test("returns CHAPTER_NOT_FOUND for a missing chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(
      app,
      `/chapters/00000000-0000-0000-0000-000000000000/groups/${SEEDED_GROUP_ID}`,
      { method: "DELETE", headers },
    )

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}/groups/${SEEDED_GROUP_ID}`, {
      method: "DELETE",
    })

    expect(res.status).toBe(401)
  })
})
