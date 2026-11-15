import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("DELETE /users/me/library/:mediaId", () => {
  test("removes the entry", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: SEEDED_MEDIA_ID, status: "READING" })
      .execute()

    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userLibraryEntries")
      .selectAll()
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns LIBRARY_ENTRY_NOT_FOUND when no entry exists", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/${randomUUID()}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("LIBRARY_ENTRY_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/library/${randomUUID()}`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/not-a-uuid`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(422)
  })
})
