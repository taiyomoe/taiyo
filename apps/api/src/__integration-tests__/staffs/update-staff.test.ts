import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

const KODACHI_ID = "54d2c255-f4a9-4bd5-b927-587ef9c4e3d2" // bio = {}, links = {}
const KISHIMOTO_ID = "7f718dfa-e5be-45ea-a5cb-0fcd3ed52d5f" // bio.en is non-empty

describe("PATCH /staffs/:id", () => {
  test("updates name", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()

    form.append("name", "Kodachi Ukyo (renamed)")

    const res = await api<{ id: string }>(app, `/staffs/${KODACHI_ID}`, {
      method: "PATCH",
      headers,
      form,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("staffs")
      .select(["name"])
      .where("id", "=", KODACHI_ID)
      .executeTakeFirst()

    expect(row?.name).toBe("Kodachi Ukyo (renamed)")
  })

  test("merges bio per-key (add)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()

    form.append("bio.ja", "日本語のバイオ")

    const res = await api(app, `/staffs/${KISHIMOTO_ID}`, { method: "PATCH", headers, form })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("staffs")
      .select(["bio"])
      .where("id", "=", KISHIMOTO_ID)
      .executeTakeFirst()
    const bio = row?.bio as Record<string, string>

    expect(bio.ja).toBe("日本語のバイオ")
    expect(bio.en).toBeTruthy() // existing en bio is preserved
  })

  test("merges bio per-key (clear with empty value)", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()

    form.append("bio.en", "")

    const res = await api(app, `/staffs/${KISHIMOTO_ID}`, { method: "PATCH", headers, form })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("staffs")
      .select(["bio"])
      .where("id", "=", KISHIMOTO_ID)
      .executeTakeFirst()
    const bio = row?.bio as Record<string, string>

    expect(bio.en).toBeUndefined()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const form = new FormData()

    form.append("name", "no auth")

    const res = await api(app, `/staffs/${KODACHI_ID}`, { method: "PATCH", form })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const form = new FormData()

    form.append("name", "banned")

    const res = await api(app, `/staffs/${KODACHI_ID}`, { method: "PATCH", headers, form })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const form = new FormData()

    form.append("name", "user")

    const res = await api(app, `/staffs/${KODACHI_ID}`, { method: "PATCH", headers, form })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns VALIDATION_ERROR when no fields are provided", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()
    const res = await api(app, `/staffs/${KODACHI_ID}`, { method: "PATCH", headers, form })

    expect(res.status).toBe(422)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  test("returns STAFF_NOT_FOUND for an unknown staff", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const form = new FormData()

    form.append("name", "anything")

    const res = await api(app, `/staffs/00000000-0000-0000-0000-000000000000`, {
      method: "PATCH",
      headers,
      form,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("STAFF_NOT_FOUND")
  })
})
