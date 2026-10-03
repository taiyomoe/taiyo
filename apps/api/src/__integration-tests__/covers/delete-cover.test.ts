import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { waitForMeiliMediaDoc } from "../helpers/wait"
import { test } from "../setup"

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const SEEDED_MAIN_COVER_ID = "a56cc54d-7776-4787-9b21-97a4674b80bc"
const SEEDED_NON_MAIN_COVER_ID = "7bfc322a-cd61-4546-b1e5-aaabdaf7524c"

describe("DELETE /covers/:id", () => {
  test("deletes a non-main cover (DB + Meili)", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const res = await api<{ id: string }>(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    const row = await services.db
      .selectFrom("covers")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", SEEDED_NON_MAIN_COVER_ID)
      .executeTakeFirst()

    expect(row?.deletedAt).not.toBeNull()
    expect(row?.deleterId).toBe(userId)

    const meiliDoc = await waitForMeiliMediaDoc(services, SEEDED_MEDIA_ID)

    expect(meiliDoc).not.toBeNull()
  })

  test("returns COVER_IS_MAIN when targeting the main cover", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/covers/${SEEDED_MAIN_COVER_ID}`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COVER_IS_MAIN")

    const row = await services.db
      .selectFrom("covers")
      .select("deletedAt")
      .where("id", "=", SEEDED_MAIN_COVER_ID)
      .executeTakeFirst()

    expect(row?.deletedAt).toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, { method: "DELETE" })

    expect(res.status).toBe(401)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "DELETE",
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
    const res = await api(app, `/covers/${SEEDED_NON_MAIN_COVER_ID}`, {
      method: "DELETE",
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
    const res = await api(app, `/covers/00000000-0000-0000-0000-000000000000`, {
      method: "DELETE",
      headers,
    })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("COVER_NOT_FOUND")
  })
})
