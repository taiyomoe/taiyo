import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /banners", () => {
  test("deletes the banners and reports the missing ones", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const bannerId = randomUUID()
    const missing = randomUUID()

    await services.db
      .insertInto("banners")
      .values({
        id: bannerId,
        mediaId: SEEDED_MEDIA_ID,
        uploaderId: userId,
        contentRating: "NORMAL",
      })
      .execute()

    const res = await api<BulkResult>(app, "/banners", {
      method: "DELETE",
      headers,
      json: { bannerIds: [bannerId, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [bannerId],
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })

    const row = await services.db
      .selectFrom("banners")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", bannerId)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).not.toBeNull()
    expect(row.deleterId).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/banners", {
      method: "DELETE",
      json: { bannerIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/banners", {
      method: "DELETE",
      headers,
      json: { bannerIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects regular users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/banners", {
      method: "DELETE",
      headers,
      json: { bannerIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/banners", { method: "DELETE", headers, json: { bannerIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
