import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { waitForMeiliMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MAIN_COVER_ID = "a56cc54d-7776-4787-9b21-97a4674b80bc"
const SEEDED_NON_MAIN_COVER_ID = "7bfc322a-cd61-4546-b1e5-aaabdaf7524c"

describe("POST /covers/:id/set-main", () => {
  test("promotes a cover to main and demotes the previous main", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api<{ id: string }>(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}/set-main`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const rows = await services.db
      .selectFrom("covers")
      .select(["id", "isMainCover"])
      .where("id", "in", [SEEDED_MAIN_COVER_ID, SEEDED_NON_MAIN_COVER_ID])
      .execute()
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.isMainCover]))

    expect(byId[SEEDED_NON_MAIN_COVER_ID]).toBe(true)
    expect(byId[SEEDED_MAIN_COVER_ID]).toBe(false)

    const meiliDoc = await waitForMeiliMediaDoc(services, SEEDED_MEDIA_ID)

    expect(meiliDoc).not.toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}/set-main`, {
      method: "POST",
    })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}/set-main`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("rejects USER role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "USER" })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}/set-main`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(403)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FORBIDDEN")
  })

  test("returns COVER_NOT_FOUND for an unknown cover", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/covers/00000000-0000-0000-0000-000000000000/set-main`, {
      method: "POST",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COVER_NOT_FOUND")
  })
})
