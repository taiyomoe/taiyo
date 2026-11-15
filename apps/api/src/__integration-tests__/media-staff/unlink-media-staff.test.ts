import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const KODACHI_STAFF_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2"

describe("DELETE /medias/:id/staffs/:staffId/:role", () => {
  test("unlinks a staff from a media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs/${KODACHI_STAFF_ID}/AUTHOR`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("mediaStaffs")
      .select("staffId")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .where("staffId", "=", KODACHI_STAFF_ID)
      .where("role", "=", "AUTHOR")
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns MEDIA_STAFF_NOT_FOUND when link does not exist", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs/${randomUUID()}/AUTHOR`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_STAFF_NOT_FOUND")
  })

  test("returns MEDIA_NOT_FOUND for an unknown media", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(
      app,
      `/medias/00000000-0000-0000-0000-000000000000/staffs/${KODACHI_STAFF_ID}/AUTHOR`,
      { method: "DELETE", headers },
    )

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("MEDIA_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid role", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(
      app,
      `/medias/${SEEDED_MEDIA_ID}/staffs/${KODACHI_STAFF_ID}/INVALID_ROLE`,
      { method: "DELETE", headers },
    )

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/${SEEDED_MEDIA_ID}/staffs/${KODACHI_STAFF_ID}/AUTHOR`, {
      method: "DELETE",
    })

    expect(res.status).toBe(401)
  })
})
