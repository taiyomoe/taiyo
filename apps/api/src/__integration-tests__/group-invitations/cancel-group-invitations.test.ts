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
    groupId,
    inviterId,
    permissions = [],
    status = "PENDING",
  }: {
    groupId: string
    inviterId: string
    permissions?: GroupPermission[]
    status?: "PENDING" | "ACCEPTED"
  },
) => {
  const invitee = await signInAs(services)
  const { id } = await services.db
    .insertInto("groupInvitations")
    .values({
      groupId,
      inviteeId: invitee.userId,
      inviterId,
      permissions,
      status,
      expiresAt: sql<Date>`CURRENT_TIMESTAMP + interval '7 days'`,
    })
    .returning("id")
    .executeTakeFirstOrThrow()

  return id
}
const setup = async (services: Services) => {
  const owner = await signInAs(services)
  const groupId = await seedGroup(services, owner.userId, `Group ${randomUUID()}`)

  await seedMembership(services, { groupId, userId: owner.userId, role: "OWNER" })

  return { owner, groupId }
}
const getStatuses = async ({ db }: Services, ids: string[]) =>
  Object.fromEntries(
    (
      await db
        .selectFrom("groupInvitations")
        .select(["id", "status"])
        .where("id", "in", ids)
        .execute()
    ).map((row) => [row.id, row.status]),
  )
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /groups/:id/invitations", () => {
  test("cancels the pending invitations and reports the others", async ({ app, services }) => {
    const { owner, groupId } = await setup(services)
    const first = await seedInvitation(services, { groupId, inviterId: owner.userId })
    const second = await seedInvitation(services, { groupId, inviterId: owner.userId })
    const accepted = await seedInvitation(services, {
      groupId,
      inviterId: owner.userId,
      status: "ACCEPTED",
    })
    const other = await setup(services)
    const elsewhere = await seedInvitation(services, {
      groupId: other.groupId,
      inviterId: other.owner.userId,
    })
    const res = await api<BulkResult>(app, `/groups/${groupId}/invitations`, {
      method: "DELETE",
      headers: owner.headers,
      json: { invitationIds: [first, second, accepted, elsewhere] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first, second],
      skipped: [
        { id: accepted, reason: "NOT_PENDING" },
        { id: elsewhere, reason: "NOT_FOUND" },
      ],
    })
    expect(await getStatuses(services, [first, second, accepted, elsewhere])).toEqual({
      [first]: "CANCELLED",
      [second]: "CANCELLED",
      [accepted]: "ACCEPTED",
      [elsewhere]: "PENDING",
    })

    const [log] = await findAuditLogs(services, "group.invitation.CANCEL_MANY")

    expect(log?.targetId).toBe(groupId)
    expect(log?.event).toMatchObject({
      audit: { changes: { after: { invitationIds: [first, second] } } },
    })
  })

  test("a manager cancels their own invitations and the ones they could send", async ({
    app,
    services,
  }) => {
    const { owner, groupId } = await setup(services)
    const manager = await signInAs(services)

    await seedMembership(services, {
      groupId,
      userId: manager.userId,
      permissions: ["MANAGE_MEMBERS", "UPLOAD_CHAPTERS"],
    })

    const own = await seedInvitation(services, { groupId, inviterId: manager.userId })
    const grantable = await seedInvitation(services, {
      groupId,
      inviterId: owner.userId,
      permissions: ["UPLOAD_CHAPTERS"],
    })
    const stronger = await seedInvitation(services, {
      groupId,
      inviterId: owner.userId,
      permissions: ["EDIT_GROUP"],
    })
    const res = await api<BulkResult>(app, `/groups/${groupId}/invitations`, {
      method: "DELETE",
      headers: manager.headers,
      json: { invitationIds: [own, grantable, stronger] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [own, grantable],
      skipped: [{ id: stronger, reason: "FORBIDDEN" }],
    })
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/groups/${randomUUID()}/invitations`, {
      method: "DELETE",
      headers,
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 404, "GROUP_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid ID", async ({ app, services }) => {
    const { owner, groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/invitations`, {
      method: "DELETE",
      headers: owner.headers,
      json: { invitationIds: ["not-a-uuid"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/invitations`, {
      method: "DELETE",
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/groups/${groupId}/invitations`, {
      method: "DELETE",
      headers,
      json: { invitationIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })
})
