import { type GroupPermission, sql } from "@taiyomoe/db"
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
  {
    inviteeId,
    inviterRole = "OWNER",
    permissions = [],
    status = "PENDING",
    expiresInDays = 7,
  }: {
    inviteeId: string
    inviterRole?: "OWNER" | "MEMBER"
    permissions?: GroupPermission[]
    status?: "PENDING" | "DECLINED"
    expiresInDays?: number
  },
) => {
  const inviter = await signInAs(services)
  const groupId = await seedGroup(services, inviter.userId, `Zyxwv ${randomUUID()}`)

  await seedMembership(services, { groupId, userId: inviter.userId, role: inviterRole })

  const { id } = await services.db
    .insertInto("groupInvitations")
    .values({
      groupId,
      inviteeId,
      inviterId: inviter.userId,
      permissions,
      status,
      expiresAt: sql<Date>`CURRENT_TIMESTAMP + make_interval(days => ${expiresInDays})`,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  return { id, groupId }
}
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("POST /group-invitations/accept", () => {
  test("joins the groups and reports the invitations that cannot be accepted", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services)
    const first = await seedInvitation(services, {
      inviteeId: userId,
      permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    })
    const second = await seedInvitation(services, { inviteeId: userId })
    const expired = await seedInvitation(services, { inviteeId: userId, expiresInDays: -1 })
    const declined = await seedInvitation(services, { inviteeId: userId, status: "DECLINED" })
    const invalid = await seedInvitation(services, {
      inviteeId: userId,
      inviterRole: "MEMBER",
      permissions: ["UPLOAD_CHAPTERS"],
    })
    const member = await seedInvitation(services, { inviteeId: userId })

    await seedMembership(services, { groupId: member.groupId, userId })

    const missing = randomUUID()
    const res = await api<BulkResult>(app, "/group-invitations/accept", {
      method: "POST",
      headers,
      json: {
        invitationIds: [
          first.id,
          second.id,
          expired.id,
          declined.id,
          invalid.id,
          member.id,
          missing,
        ],
      },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [first.id, second.id],
      skipped: [
        { id: expired.id, reason: "EXPIRED" },
        { id: declined.id, reason: "NOT_PENDING" },
        { id: invalid.id, reason: "INVALID" },
        { id: member.id, reason: "ALREADY_MEMBER" },
        { id: missing, reason: "NOT_FOUND" },
      ],
    })

    const memberships = await services.db
      .selectFrom("groupMemberships")
      .select(["groupId", "role", "permissions"])
      .where("userId", "=", userId)
      .where("groupId", "in", [first.groupId, second.groupId, invalid.groupId])
      .execute()

    expect(memberships).toHaveLength(2)
    expect(memberships.find((row) => row.groupId === first.groupId)).toMatchObject({
      role: "MEMBER",
      permissions: ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS"],
    })

    const [log] = await findAuditLogs(services, "group.invitation.ACCEPT_MANY")

    expect(log?.event).toMatchObject({
      audit: {
        changes: {
          after: {
            invitationIds: [first.id, second.id],
            groupIds: [first.groupId, second.groupId],
          },
        },
      },
    })
  })

  test("does not accept invitations sent to someone else", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const other = await signInAs(services)
    const invitation = await seedInvitation(services, { inviteeId: other.userId })
    const res = await api<BulkResult>(app, "/group-invitations/accept", {
      method: "POST",
      headers,
      json: { invitationIds: [invitation.id] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [],
      skipped: [{ id: invitation.id, reason: "NOT_FOUND" }],
    })
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/group-invitations/accept", {
      method: "POST",
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, "/group-invitations/accept", {
      method: "POST",
      headers,
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, "/group-invitations/accept", {
      method: "POST",
      headers,
      json: { invitationIds: [] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
