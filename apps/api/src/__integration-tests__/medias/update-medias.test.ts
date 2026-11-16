import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedMedia } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /medias", () => {
  test("sets the same fields on every media and skips the missing ones", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const first = await seedMedia(services, userId)
    const second = await seedMedia(services, userId)
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [first, second, missing], status: "FINISHED", contentRating: "NSFW" },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      done: [first, second],
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })

    const rows = await services.db
      .selectFrom("medias")
      .select(["status", "contentRating", "type"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toEqual([
      { status: "FINISHED", contentRating: "NSFW", type: "MANGA" },
      { status: "FINISHED", contentRating: "NSFW", type: "MANGA" },
    ])

    const [log] = await findAuditLogs(services, "media.UPDATE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { mediaIds: [first, second], status: "FINISHED" } } },
    })
  })

  test("skips deleted medias", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", mediaId)
      .execute()

    const res = await api<BulkResult>(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [mediaId], type: "MANHWA" },
    })

    expect(res.body.success && res.body.data.skipped).toEqual([
      { id: mediaId, reason: "NOT_FOUND" },
    ])
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/medias", {
      method: "PATCH",
      json: { mediaIds: [randomUUID()], status: "FINISHED" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [randomUUID()], status: "FINISHED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects regular users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [randomUUID()], status: "FINISHED" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a request without any field with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/medias", {
      method: "PATCH",
      headers,
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
