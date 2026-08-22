import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

// Three seeded media — picked for variety. Their existence is checked via the
// seed files (media-1, media-2, media-3) so the inserts don't FK-violate.
const SEEDED_MEDIA_IDS = [
  "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
  "7a99da64-56e7-4bf6-8159-8db0d3b4f231",
  "104a9efc-ef2a-4bf4-807b-2d949d78e3b6",
]

describe("GET /users/me/library", () => {
  test("returns the user's library", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId, mediaId: SEEDED_MEDIA_IDS[0]!, status: "READING" },
        { userId, mediaId: SEEDED_MEDIA_IDS[1]!, status: "COMPLETED" },
        { userId, mediaId: SEEDED_MEDIA_IDS[2]!, status: "DROPPED" },
      ])
      .execute()

    const res = await api<unknown[]>(app, `/users/me/library`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(3)
  })

  test("filters by status", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId, mediaId: SEEDED_MEDIA_IDS[0]!, status: "READING" },
        { userId, mediaId: SEEDED_MEDIA_IDS[1]!, status: "COMPLETED" },
        { userId, mediaId: SEEDED_MEDIA_IDS[2]!, status: "READING" },
      ])
      .execute()

    const res = await api<{ status: string }[]>(app, `/users/me/library?status=READING`, {
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(2)
    expect(res.body.data.every((item) => item.status === "READING")).toBe(true)
  })

  test("respects perPage and reports total", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values([
        { userId, mediaId: SEEDED_MEDIA_IDS[0]!, status: "READING" },
        { userId, mediaId: SEEDED_MEDIA_IDS[1]!, status: "COMPLETED" },
        { userId, mediaId: SEEDED_MEDIA_IDS[2]!, status: "READING" },
      ])
      .execute()

    const res = await api<unknown[]>(app, `/users/me/library?perPage=2`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(2)
    expect(res.body.meta).toMatchObject({ page: 1, perPage: 2, total: 3 })
  })

  test("returns an empty library for a fresh user", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api<unknown[]>(app, `/users/me/library`, { headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(0)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/me/library`)

    expect(res.status).toBe(401)
  })
})
