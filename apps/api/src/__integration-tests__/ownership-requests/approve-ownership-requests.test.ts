import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMembership } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const seedRequest = async (
  { db }: Services,
  {
    userId,
    groupId,
    status = "PENDING",
  }: {
    userId: string
    groupId: string
    status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  },
) =>
  (
    await db
      .insertInto("groupOwnershipRequests")
      .values({ userId, groupId, status, message: null })
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

describe("POST /ownership-requests/approve", () => {
  test("approves one request per group and reports the others", async ({ app, services }) => {
    const { headers, userId: adminId } = await signInAs(services, { role: "ADMIN" })
    const first = await signInAs(services)
    const second = await signInAs(services)
    const groupId = await seedGroup(services, adminId, `Zyxwv ${randomUUID()}`)
    const ownedGroupId = await seedGroup(services, adminId, `Zyxwv ${randomUUID()}`)
    const closedGroupId = await seedGroup(services, adminId, `Zyxwv ${randomUUID()}`)

    await seedMembership(services, { groupId: ownedGroupId, userId: second.userId, role: "OWNER" })

    const winner = await seedRequest(services, { userId: first.userId, groupId })
    const loser = await seedRequest(services, { userId: second.userId, groupId })
    const owned = await seedRequest(services, { userId: first.userId, groupId: ownedGroupId })
    const closed = await seedRequest(services, {
      userId: first.userId,
      groupId: closedGroupId,
      status: "REJECTED",
    })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/ownership-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [winner, loser, owned, closed, missing] },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [winner],
      skipped: [
        { id: loser, reason: "NOT_PENDING" },
        { id: owned, reason: "ALREADY_OWNED" },
        { id: closed, reason: "NOT_PENDING" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const requests = await services.db
      .selectFrom("groupOwnershipRequests")
      .select(["id", "status", "reviewerId"])
      .where("id", "in", [winner, loser, owned])
      .execute()
    const membership = await services.db
      .selectFrom("groupMemberships")
      .select("role")
      .where("groupId", "=", groupId)
      .where("userId", "=", first.userId)
      .executeTakeFirst()

    expect(requests.find((row) => row.id === winner)).toMatchObject({
      status: "APPROVED",
      reviewerId: adminId,
    })
    expect(requests.find((row) => row.id === loser)?.status).toBe("CANCELLED")
    expect(requests.find((row) => row.id === owned)?.status).toBe("PENDING")
    expect(membership?.role).toBe("OWNER")

    const [log] = await findAuditLogs(services, "group.ownership.REQUEST_APPROVE_MANY")

    expect(log?.event).toMatchObject({ audit: { changes: { after: { requestIds: [winner] } } } })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/ownership-requests/approve", {
      method: "POST",
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/ownership-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "MODERATOR" })
    const groupId = await seedGroup(services, userId, `Zyxwv ${randomUUID()}`)
    const requestId = await seedRequest(services, { userId, groupId })
    const res = await api(app, "/ownership-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [requestId] },
    })

    expectFailure(res, 403, "FORBIDDEN")

    const row = await services.db
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", requestId)
      .executeTakeFirstOrThrow()

    expect(row.status).toBe("PENDING")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/ownership-requests/approve", {
      method: "POST",
      headers,
      json: { requestIds: [] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
