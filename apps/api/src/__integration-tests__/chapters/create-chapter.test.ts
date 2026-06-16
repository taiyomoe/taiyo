import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"

describe("POST /medias/:id/chapters", () => {
  test("creates a chapter", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api<{ id: string }>(app, `/medias/${SEEDED_MEDIA_ID}/chapters`, {
      method: "POST",
      headers,
      json: { number: 9999, language: "en" },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("chapters")
      .selectAll()
      .where("id", "=", res.body.data.id)
      .executeTakeFirst()

    expect(row?.number).toBe(9999)
    expect(row?.language).toBe("en")
    expect(row?.mediaId).toBe(SEEDED_MEDIA_ID)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters`, {
      method: "POST",
      json: { number: 1, language: "en" },
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters`, {
      method: "POST",
      headers,
      json: { number: 1, language: "en" },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters`, {
      method: "POST",
      headers,
      json: { number: 1, language: "en" },
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when number is missing", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/chapters`, {
      method: "POST",
      headers,
      json: { language: "en" },
    })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/chapters`, {
      method: "POST",
      headers,
      json: { number: 1, language: "en" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })
})
