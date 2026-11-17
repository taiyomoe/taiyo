import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const seedRequest = async (
  { db }: Services,
  {
    userId,
    name = `Zyxwv ${randomUUID()}`,
    status = "PENDING",
  }: { userId: string; name?: string; status?: "PENDING" | "REJECTED" },
) =>
  (
    await db
      .insertInto("groupCreationRequests")
      .values({ userId, name, status, message: "I lead this group." })
      .returning("id")
      .executeTakeFirstOrThrow()
  ).id
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /group-creation-requests/approve", () => {
  test("creates the groups and reports duplicates, closed and missing requests", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const first = await signInAs(services)
    const second = await signInAs(services)
    const name = `Zyxwv ${randomUUID()}`
    const created = await seedRequest(services, { userId: first.userId, name })
    const sameName = await seedRequest(services, {
      userId: second.userId,
      name: name.toUpperCase(),
    })
    const other = await seedRequest(services, { userId: second.userId })
    const rejected = await seedRequest(services, { userId: first.userId, status: "REJECTED" })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/group-creation-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [created, sameName, other, rejected, missing] },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [created, other],
      skipped: [
        { id: sameName, reason: "NAME_TAKEN" },
        { id: rejected, reason: "NOT_PENDING" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const requests = await services.db
      .selectFrom("groupCreationRequests")
      .select(["id", "status", "groupId", "userId"])
      .where("id", "in", [created, other, sameName])
      .execute()

    expect(requests.find((row) => row.id === sameName)).toMatchObject({
      status: "PENDING",
      groupId: null,
    })

    for (const id of [created, other]) {
      const request = requests.find((row) => row.id === id)

      expect(request?.status).toBe("APPROVED")

      const owner = await services.db
        .selectFrom("groupMemberships")
        .select(["userId", "role"])
        .where("groupId", "=", request?.groupId ?? randomUUID())
        .executeTakeFirst()

      expect(owner).toEqual({ userId: request?.userId, role: "OWNER" })
    }

    const [log] = await findAuditLogs(services, "group.creation.REQUEST_APPROVE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { requestIds: [created, other] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/group-creation-requests/approve", {
      method: "POST",
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/group-creation-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const requestId = await seedRequest(services, { userId })
    const res = await api(app, "/group-creation-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [requestId] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/group-creation-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
