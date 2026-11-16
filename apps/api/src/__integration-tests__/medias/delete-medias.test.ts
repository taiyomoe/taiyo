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

describe("DELETE /medias", () => {
  test("deletes the medias and reports the missing and already deleted ones", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
    const live = await seedMedia(services, userId)
    const gone = await seedMedia(services, userId)
    const missing = randomUUID()

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", gone)
      .execute()

    const res = await api<BulkResult>(app, "/medias", {
      method: "DELETE",
      headers,
      json: { mediaIds: [live, gone, missing] },
    })

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      done: [live],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: gone, reason: "ALREADY_DELETED" },
      ],
    })

    const row = await services.db
      .selectFrom("medias")
      .select(["deletedAt", "deleterId"])
      .where("id", "=", live)
      .executeTakeFirstOrThrow()

    expect(row.deletedAt).not.toBeNull()
    expect(row.deleterId).toBe(userId)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/medias", { method: "DELETE", json: { mediaIds: [randomUUID()] } })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/medias", {
      method: "DELETE",
      headers,
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/medias", {
      method: "DELETE",
      headers,
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/medias", { method: "DELETE", headers, json: { mediaIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
