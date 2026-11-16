import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
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

describe("POST /medias/restore", () => {
  test("restores the deleted medias and reports the others", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const gone = await seedMedia(services, userId)
    const live = await seedMedia(services, userId)
    const missing = randomUUID()

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date(), deleterId: userId })
      .where("id", "=", gone)
      .execute()

    const res = await api<BulkResult>(app, "/medias/restore", {
      method: "POST",
      headers,
      json: { mediaIds: [gone, live, missing] },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      done: [gone],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: live, reason: "NOT_DELETED" },
      ],
    })

    const row = await services.db
      .selectFrom("medias")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", gone)
      .executeTakeFirstOrThrow()

    expect(row).toEqual({ deletedAt: null, deleterId: null })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/medias/restore", {
      method: "POST",
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/medias/restore", {
      method: "POST",
      headers,
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })
    const res = await api(app, "/medias/restore", {
      method: "POST",
      headers,
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects a malformed ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/medias/restore", {
      method: "POST",
      headers,
      json: { mediaIds: ["nope"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
