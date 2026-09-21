import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { waitForMeiliMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_NON_MAIN_COVER_ID = "7bfc322a-cd61-4546-b1e5-aaabdaf7524c"

describe("PATCH /covers/:id", () => {
  test("updates a cover (DB + Meili)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api<{ id: string }>(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(SEEDED_NON_MAIN_COVER_ID)

    const row = await services.db
      .selectFrom("covers")
      .select("contentRating")
      .where("id", "=", SEEDED_NON_MAIN_COVER_ID)
      .executeTakeFirst()

    expect(row?.contentRating).toBe("SUGGESTIVE")

    const meiliDoc = await waitForMeiliMediaDoc(services, SEEDED_MEDIA_ID)

    expect(meiliDoc).not.toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "PATCH",
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when no fields are provided", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "PATCH",
      headers,
      json: {},
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns COVER_NOT_FOUND for an unknown cover", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/covers/00000000-0000-0000-0000-000000000000`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COVER_NOT_FOUND")
  })
})
