import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("PUT /users/me/library/:mediaId", () => {
  test("adds media to the library with a status", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userLibraryEntries")
      .selectAll()
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirstOrThrow()

    expect(row.status).toBe("READING")
  })

  test("is idempotent — calling twice keeps one row", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })
    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })

    const rows = await services.db
      .selectFrom("userLibraryEntries")
      .selectAll()
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .execute()

    expect(rows).toHaveLength(1)
  })

  test("moves media between buckets", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })

    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "COMPLETED" },
    })

    const row = await services.db
      .selectFrom("userLibraryEntries")
      .select("status")
      .where("userId", "=", userId)
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .executeTakeFirstOrThrow()

    expect(row.status).toBe("COMPLETED")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/${randomUUID()}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      json: { status: "READING" },
    })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "READING" },
    })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for missing status", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)
  })
})
