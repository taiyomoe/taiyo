import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const SEEDED_MAIN_COVER_ID = "a56cc54d-7776-4787-9b21-97a4674b80bc"
const SEEDED_NON_MAIN_COVER_ID = "7bfc322a-cd61-4546-b1e5-aaabdaf7524c"
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /covers", () => {
  test("deletes the covers and keeps the main one", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/covers", {
      method: "DELETE",
      headers,
      json: { coverIds: [SEEDED_NON_MAIN_COVER_ID, SEEDED_MAIN_COVER_ID, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [SEEDED_NON_MAIN_COVER_ID],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: SEEDED_MAIN_COVER_ID, reason: "MAIN_COVER" },
      ],
    })

    const rows = await services.db
      .selectFrom("covers")
      .select(["id", "deletedAt", "deleterId"])
      .where("id", "in", [SEEDED_NON_MAIN_COVER_ID, SEEDED_MAIN_COVER_ID])
      .execute()
    const byId = new Map(rows.map((row) => [row.id, row]))

    expect(byId.get(SEEDED_NON_MAIN_COVER_ID)?.deleterId).toBe(userId)
    expect(byId.get(SEEDED_MAIN_COVER_ID)?.deletedAt).toBeNull()
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/covers", { method: "DELETE", json: { coverIds: [randomUUID()] } })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/covers", {
      method: "DELETE",
      headers,
      json: { coverIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects regular users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/covers", {
      method: "DELETE",
      headers,
      json: { coverIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/covers", { method: "DELETE", headers, json: { coverIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
