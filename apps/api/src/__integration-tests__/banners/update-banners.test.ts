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

describe("PATCH /banners", () => {
  test("sets the same rating on every banner", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const ids = [randomUUID(), randomUUID()]
    const missing = randomUUID()

    await services.db
      .insertInto("banners")
      .values(
        ids.map((id) => ({
          id,
          mediaId: SEEDED_MEDIA_ID,
          uploaderId: userId,
          contentRating: "NORMAL" as const,
        })),
      )
      .execute()

    const res = await api<BulkResult>(app, "/banners", {
      method: "PATCH",
      headers,
      json: { bannerIds: [...ids, missing], contentRating: "NSFW" },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: ids,
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })

    const rows = await services.db
      .selectFrom("banners")
      .select("contentRating")
      .where("id", "in", ids)
      .execute()

    expect(rows).toEqual([{ contentRating: "NSFW" }, { contentRating: "NSFW" }])
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/banners", {
      method: "PATCH",
      json: { bannerIds: [randomUUID()], contentRating: "NSFW" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/banners", {
      method: "PATCH",
      headers,
      json: { bannerIds: [randomUUID()], contentRating: "NSFW" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects regular users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/banners", {
      method: "PATCH",
      headers,
      json: { bannerIds: [randomUUID()], contentRating: "NSFW" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a missing rating with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/banners", {
      method: "PATCH",
      headers,
      json: { bannerIds: [randomUUID()] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
