import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const seedList = async ({ db }: Services, userId: string, visibility: "PUBLIC" | "PRIVATE") =>
  (
    await db
      .insertInto("userLists")
      .values({ userId, name: `List ${randomUUID()}`, visibility })
      .returning("id")
      .executeTakeFirstOrThrow()
  ).id
const getDeletedIds = async ({ db }: Services, ids: string[]) =>
  (
    await db
      .selectFrom("userLists")
      .select("id")
      .where("id", "in", ids)
      .where("deletedAt", "is not", null)
      .execute()
  ).map((row) => row.id)
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /lists", () => {
  test("lets moderators delete their own lists and the PUBLIC lists of others", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)
    const own = await seedList(services, moderator.userId, "PRIVATE")
    const open = await seedList(services, userId, "PUBLIC")
    const hidden = await seedList(services, userId, "PRIVATE")
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/lists", {
      method: "DELETE",
      headers: moderator.headers,
      json: { listIds: [own, open, hidden, missing] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [own, open],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: hidden, reason: "FORBIDDEN" },
      ],
    })
    expect((await getDeletedIds(services, [own, open, hidden])).sort()).toEqual([own, open].sort())

    const [log] = await findAuditLogs(services, "list.DELETE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { listIds: [own, open] } } },
    })
  })

  test("lets users delete only their own lists", async ({ app, services }) => {
    const user = await signInAs(services)
    const { userId: otherId } = await signInAs(services)
    const own = await seedList(services, user.userId, "PUBLIC")
    const theirs = await seedList(services, otherId, "PUBLIC")
    const res = await api<BulkResult>(app, "/lists", {
      method: "DELETE",
      headers: user.headers,
      json: { listIds: [own, theirs] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [own],
      skipped: [{ id: theirs, reason: "FORBIDDEN" }],
    })
    expect(await getDeletedIds(services, [own, theirs])).toEqual([own])
  })

  test("skips lists that are already deleted", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const listId = await seedList(services, userId, "PUBLIC")

    await services.db
      .updateTable("userLists")
      .set({ deletedAt: new Date() })
      .where("id", "=", listId)
      .execute()

    const res = await api<BulkResult>(app, "/lists", {
      method: "DELETE",
      headers,
      json: { listIds: [listId] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [],
      skipped: [{ id: listId, reason: "NOT_FOUND" }],
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/lists", { method: "DELETE", json: { listIds: [randomUUID()] } })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { banned: true })
    const listId = await seedList(services, userId, "PUBLIC")
    const res = await api(app, "/lists", { method: "DELETE", headers, json: { listIds: [listId] } })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty selection with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/lists", { method: "DELETE", headers, json: { listIds: [] } })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
