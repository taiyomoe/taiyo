import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const seedRequest = async (
  services: Services,
  { userId, status = "PENDING" }: { userId: string; status?: "PENDING" | "APPROVED" },
) => {
  const groupId = await seedGroup(services, userId, `Zyxwv ${randomUUID()}`)

  return (
    await services.db
      .insertInto("groupOwnershipRequests")
      .values({ userId, groupId, status, message: null })
      .returning("id")
      .executeTakeFirstOrThrow()
  ).id
}
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /ownership-requests/reject", () => {
  test("rejects the pending requests with the note and reports the others", async ({
    app,
    services,
  }) => {
    const { headers, userId: adminId } = await signInAs(services, { role: "ADMIN" })
    const { userId } = await signInAs(services)
    const first = await seedRequest(services, { userId })
    const second = await seedRequest(services, { userId })
    const approved = await seedRequest(services, { userId, status: "APPROVED" })
    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/ownership-requests/reject", {
      method: "POST",
      headers,
      json: { requestIds: [first, second, approved, missing], note: "  No proof.  " },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: missing, reason: "NOT_FOUND" },
        { id: approved, reason: "NOT_PENDING" },
      ],
    })

    const rows = await services.db
      .selectFrom("groupOwnershipRequests")
      .select(["status", "reviewerId", "reviewerNote"])
      .where("id", "in", [first, second])
      .execute()

    expect(rows).toEqual([
      { status: "REJECTED", reviewerId: adminId, reviewerNote: "No proof." },
      { status: "REJECTED", reviewerId: adminId, reviewerNote: "No proof." },
    ])

    const [log] = await findAuditLogs(services, "group.ownership.REQUEST_REJECT_MANY")

    expect(log?.event).toMatchObject({
      audit: { reason: "No proof.", changes: { after: { requestIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/ownership-requests/reject", {
      method: "POST",
      json: { requestIds: [randomUUID()], note: "No proof." },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/ownership-requests/reject", {
      method: "POST",
      headers,
      json: { requestIds: [randomUUID()], note: "No proof." },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const res = await api(app, "/ownership-requests/reject", {
      method: "POST",
      headers,
      json: { requestIds: [randomUUID()], note: "No proof." },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("requires a note", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/ownership-requests/reject", {
      method: "POST",
      headers,
      json: { requestIds: [randomUUID()], note: "   " },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
