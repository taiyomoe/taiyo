import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { timestamp } from "../helpers/seed"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const OTHER_MEDIA_ID = "7a99da64-56e7-4bf6-8159-8db0d3b4f231"

type LibraryEntry = {
  mediaId: string
  status: string
  createdAt: string
  updatedAt: string
}

describe("GET /users/me/library/:mediaId", () => {
  test("returns the library entry for the media", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const createdAt = new Date("2026-01-01T00:00:00.000Z")
    const updatedAt = new Date("2026-02-01T00:00:00.000Z")

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        {
          userId,
          mediaId: SEEDED_MEDIA_ID,
          status: "ON_HOLD",
          createdAt: timestamp(createdAt),
          updatedAt: timestamp(updatedAt),
        },
        { userId, mediaId: OTHER_MEDIA_ID, status: "COMPLETED" },
      ])
      .execute()

    const res = await api<LibraryEntry | null>(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      mediaId: SEEDED_MEDIA_ID,
      status: "ON_HOLD",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  })

  test("reflects a status change made through the upsert endpoint", async ({ app, services }) => {
    const { headers } = await signInAs(services)

    await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      method: "PUT",
      headers,
      json: { status: "PLAN_TO_READ" },
    })

    const res = await api<LibraryEntry | null>(app, `/users/me/library/${SEEDED_MEDIA_ID}`, {
      headers,
    })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data?.status).toBe("PLAN_TO_READ")
  })

  test("returns null when the media is not in the library", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId, mediaId: OTHER_MEDIA_ID, status: "READING" })
      .execute()

    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toBeNull()
  })

  test("does not return another user's entry", async ({ app, services }) => {
    const other = await signInAs(services)
    const { headers } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: other.userId, mediaId: SEEDED_MEDIA_ID, status: "READING" })
      .execute()

    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`, { headers })

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toBeNull()
  })

  test("returns null for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/00000000-0000-0000-0000-000000000000`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/library/${SEEDED_MEDIA_ID}`)

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("returns VALIDATION_ERROR for an invalid uuid", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/me/library/not-a-uuid`, { headers })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })
})
