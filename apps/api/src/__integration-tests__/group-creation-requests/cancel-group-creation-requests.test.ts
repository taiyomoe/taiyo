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
  { userId, status = "PENDING" }: { userId: string; status?: "PENDING" | "APPROVED" },
) =>
  (
    await db
      .insertInto("groupCreationRequests")
      .values({ userId, name: `Zyxwv ${randomUUID()}`, status, message: "I lead this group." })
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

describe("DELETE /group-creation-requests", () => {
  test("cancels your pending requests and reports the others", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const other = await signInAs(services)
    const first = await seedRequest(services, { userId })
    const second = await seedRequest(services, { userId })
    const approved = await seedRequest(services, { userId, status: "APPROVED" })
    const someoneElse = await seedRequest(services, { userId: other.userId })
    const res = await api<BulkResult>(app, "/group-creation-requests", {
      method: "DELETE",
      headers,
      json: { requestIds: [first, second, approved, someoneElse] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: someoneElse, reason: "NOT_FOUND" },
        { id: approved, reason: "NOT_PENDING" },
      ],
    })

    const rows = await services.db
      .selectFrom("groupCreationRequests")
      .select(["id", "status"])
      .where("id", "in", [first, second, someoneElse])
      .execute()

    expect(rows.find((row) => row.id === first)?.status).toBe("CANCELLED")
    expect(rows.find((row) => row.id === second)?.status).toBe("CANCELLED")
    expect(rows.find((row) => row.id === someoneElse)?.status).toBe("PENDING")

    const [log] = await findAuditLogs(services, "group.creation.REQUEST_CANCEL_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { requestIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/group-creation-requests", {
      method: "DELETE",
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/group-creation-requests", {
      method: "DELETE",
      headers,
      json: { requestIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an invalid ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/group-creation-requests", {
      method: "DELETE",
      headers,
      json: { requestIds: ["not-a-uuid"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
