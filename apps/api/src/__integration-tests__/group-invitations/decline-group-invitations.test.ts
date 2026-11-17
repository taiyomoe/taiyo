import { sql } from "@taiyomoe/db"
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

const seedInvitation = async (
  services: Services,
  { inviteeId, status = "PENDING" }: { inviteeId: string; status?: "PENDING" | "ACCEPTED" },
) => {
  const inviter = await signInAs(services)
  const groupId = await seedGroup(services, inviter.userId, `Zyxwv ${randomUUID()}`)

  await seedMembership(services, { groupId, userId: inviter.userId, role: "OWNER" })

  const { id } = await services.db
    .insertInto("groupInvitations")
    .values({
      groupId,
      inviteeId,
      inviterId: inviter.userId,
      status,
      expiresAt: sql<Date>`CURRENT_TIMESTAMP + interval '7 days'`,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  return id
}
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /group-invitations/decline", () => {
  test("declines your pending invitations and reports the others", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const other = await signInAs(services)
    const first = await seedInvitation(services, { inviteeId: userId })
    const second = await seedInvitation(services, { inviteeId: userId })
    const accepted = await seedInvitation(services, { inviteeId: userId, status: "ACCEPTED" })
    const someoneElse = await seedInvitation(services, { inviteeId: other.userId })
    const res = await api<BulkResult>(app, "/group-invitations/decline", {
      method: "POST",
      headers,
      json: { invitationIds: [first, second, accepted, someoneElse] },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: accepted, reason: "NOT_PENDING" },
        { id: someoneElse, reason: "NOT_FOUND" },
      ],
    })

    const rows = await services.db
      .selectFrom("groupInvitations")
      .select(["id", "status"])
      .where("id", "in", [first, second, someoneElse])
      .execute()

    expect(rows.find((row) => row.id === first)?.status).toBe("DECLINED")
    expect(rows.find((row) => row.id === second)?.status).toBe("DECLINED")
    expect(rows.find((row) => row.id === someoneElse)?.status).toBe("PENDING")

    const [log] = await findAuditLogs(services, "group.invitation.DECLINE_MANY")

    expect(log?.event).toMatchObject({
      audit: { changes: { after: { invitationIds: [first, second] } } },
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/group-invitations/decline", {
      method: "POST",
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/group-invitations/decline", {
      method: "POST",
      headers,
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an invalid ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/group-invitations/decline", {
      method: "POST",
      headers,
      json: { invitationIds: ["not-a-uuid"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
