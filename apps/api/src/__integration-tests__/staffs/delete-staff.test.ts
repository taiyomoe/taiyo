import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const SEEDED_STAFF_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2"

describe("DELETE /staffs/:id", () => {
  test("soft-deletes a staff", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/staffs/${SEEDED_STAFF_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("staffs")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", SEEDED_STAFF_ID)
      .executeTakeFirst()

    expect(row?.deletedAt).not.toBeNull()
    expect(row?.deleterId).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/staffs/${SEEDED_STAFF_ID}`, { method: "DELETE" })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/staffs/${SEEDED_STAFF_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/staffs/${SEEDED_STAFF_ID}`, { method: "DELETE", headers })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns STAFF_NOT_FOUND for an unknown staff", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/staffs/00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("STAFF_NOT_FOUND")
  })
})
