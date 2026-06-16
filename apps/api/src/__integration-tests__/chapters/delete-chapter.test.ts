import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_CHAPTER_ID = "13548c83-8d1a-4163-8830-c8f16fcd2eb7"

describe("DELETE /chapters/:id", () => {
  test("soft-deletes a chapter", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("chapters")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirst()

    expect(row?.deletedAt).not.toBeNull()
    expect(row?.deleterId).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}`, { method: "DELETE" })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns CHAPTER_NOT_FOUND for an unknown chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/chapters/00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("CHAPTER_NOT_FOUND")
  })

  test("a USER who is a member of a linked group can delete the chapter", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const linked = await services.db
      .selectFrom("chapterGroups")
      .select("groupId")
      .where("chapterId", "=", SEEDED_CHAPTER_ID)
      .executeTakeFirstOrThrow()

    await services.db
      .insertInto("groupMemberships")
      .values({
        userId,
        groupId: linked.groupId,
        role: "MEMBER",
        addedBy: userId,
      })
      .execute()

    const res = await api(app, `/chapters/${SEEDED_CHAPTER_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(200)
  })
})
