import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
// Kodachi is already linked as AUTHOR. Linking same staff as ARTIST is a fresh link.
const KODACHI_STAFF_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2"

describe("POST /medias/:id/staffs", () => {
  test("links a staff with a new role", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs`, {
      method: "POST",
      headers,
      json: { staffId: KODACHI_STAFF_ID, role: "ARTIST" },
    })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("mediaStaffs")
      .selectAll()
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .where("staffId", "=", KODACHI_STAFF_ID)
      .where("role", "=", "ARTIST")
      .executeTakeFirst()

    expect(row).toBeDefined()
  })

  test("returns MEDIA_STAFF_EXISTS for an already-linked (staff, role)", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs`, {
      method: "POST",
      headers,
      json: { staffId: KODACHI_STAFF_ID, role: "AUTHOR" },
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_STAFF_EXISTS")
  })

  test("returns STAFF_NOT_FOUND for a missing staff", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs`, {
      method: "POST",
      headers,
      json: { staffId: randomUUID(), role: "AUTHOR" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("STAFF_NOT_FOUND")
  })

  test("returns MEDIA_NOT_FOUND for a missing media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/00000000-0000-0000-0000-000000000000/staffs`, {
      method: "POST",
      headers,
      json: { staffId: KODACHI_STAFF_ID, role: "AUTHOR" },
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs`, {
      method: "POST",
      json: { staffId: KODACHI_STAFF_ID, role: "ARTIST" },
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs`, {
      method: "POST",
      headers,
      json: { staffId: KODACHI_STAFF_ID, role: "ARTIST" },
    })

    expect(res.status).toBe(403)
  })
})
