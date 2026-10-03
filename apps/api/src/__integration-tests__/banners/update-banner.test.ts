import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const seedBannerRow = async (
  services: { db: import("@taiyomoe/db").Kysely<import("@taiyomoe/db").DB> },
  uploaderId: string,
) => {
  const id = randomUUID()

  await services.db
    .insertInto("banners")
    .values({ id, mediaId: SEEDED_MEDIA_ID, uploaderId, contentRating: "NORMAL" })
    .execute()

  return id
}

describe("PATCH /banners/:id", () => {
  test("updates a banner", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = await seedBannerRow(services, userId)
    const res = await api<{ id: string }>(app, `/banners/${bannerId}`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data.id).toBe(bannerId)

    const row = await services.db
      .selectFrom("banners")
      .select("contentRating")
      .where("id", "=", bannerId)
      .executeTakeFirst()

    expect(row?.contentRating).toBe("SUGGESTIVE")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = await seedBannerRow(services, userId)
    const res = await api(app, `/banners/${bannerId}`, {
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
    const { headers, userId } = await signInAs(services, { role: "ADMIN", banned: true })
    const bannerId = await seedBannerRow(services, userId)
    const res = await api(app, `/banners/${bannerId}`, {
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
    const { userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = await seedBannerRow(services, userId)
    const res = await api(app, `/banners/${bannerId}`, {
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

  test("returns VALIDATION_ERROR when contentRating is missing", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = await seedBannerRow(services, userId)
    const res = await api(app, `/banners/${bannerId}`, {
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

  test("returns BANNER_NOT_FOUND for an unknown banner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/banners/00000000-0000-0000-0000-000000000000`, {
      method: "PATCH",
      headers,
      json: { contentRating: "SUGGESTIVE" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("BANNER_NOT_FOUND")
  })
})
