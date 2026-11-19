import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/db"
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

const addMember = async (
  services: Services,
  groupId: string,
  role: GroupMembershipRole,
  permissions: GroupPermission[] = [],
) => {
  const member = await signInAs(services)

  await seedMembership(services, { groupId, userId: member.userId, role, permissions })

  return member
}
const setup = async (services: Services) => {
  const creator = await signInAs(services)
  const groupId = await seedGroup(services, creator.userId, `Group ${randomUUID()}`)

  return { groupId, owner: await addMember(services, groupId, "OWNER") }
}
const getMemberIds = async ({ db }: Services, groupId: string) =>
  (
    await db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", groupId)
      .execute()
  ).map((row) => row.userId)
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /groups/:id/members", () => {
  test("removes the members and reports the others", async ({ app, services }) => {
    const { groupId, owner } = await setup(services)
    const first = await addMember(services, groupId, "MEMBER", ["EDIT_CHAPTERS"])
    const second = await addMember(services, groupId, "MEMBER")
    const coOwner = await addMember(services, groupId, "OWNER")
    const stranger = randomUUID()
    const res = await api<BulkResult>(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      headers: owner.headers,
      json: { userIds: [first.userId, second.userId, coOwner.userId, owner.userId, stranger] },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first.userId, second.userId],
      skipped: [
        { id: coOwner.userId, reason: "FORBIDDEN" },
        { id: owner.userId, reason: "FORBIDDEN" },
        { id: stranger, reason: "NOT_FOUND" },
      ],
    })
    expect(await getMemberIds(services, groupId)).toEqual(
      expect.arrayContaining([owner.userId, coOwner.userId]),
    )
    expect(await getMemberIds(services, groupId)).toHaveLength(2)

    const [log] = await findAuditLogs(services, "group.member.REMOVE_MANY")

    expect(log?.targetId).toBe(groupId)
    expect(log?.event).toMatchObject({
      audit: { changes: { after: { userIds: [first.userId, second.userId] } } },
    })
  })

  test("a manager only removes the members whose permissions they hold", async ({
    app,
    services,
  }) => {
    const { groupId } = await setup(services)
    const manager = await addMember(services, groupId, "MEMBER", [
      "MANAGE_MEMBERS",
      "EDIT_CHAPTERS",
    ])
    const member = await addMember(services, groupId, "MEMBER", ["EDIT_CHAPTERS"])
    const stronger = await addMember(services, groupId, "MEMBER", ["DELETE_CHAPTERS"])
    const res = await api<BulkResult>(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      headers: manager.headers,
      json: { userIds: [member.userId, stronger.userId] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [member.userId],
      skipped: [{ id: stronger.userId, reason: "FORBIDDEN" }],
    })
  })

  test("returns FORBIDDEN for a member who cannot manage members", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const member = await addMember(services, groupId, "MEMBER", ["EDIT_GROUP"])
    const target = await addMember(services, groupId, "MEMBER")
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      headers: member.headers,
      json: { userIds: [target.userId] },
    })

    expectFailure(res, 403, "FORBIDDEN")
    expect(await getMemberIds(services, groupId)).toContain(target.userId)
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${randomUUID()}/members`, {
      method: "DELETE",
      headers,
      json: { userIds: [randomUUID()] },
    })

    expectFailure(res, 404, "GROUP_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR for an invalid ID", async ({ app, services }) => {
    const { groupId, owner } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      headers: owner.headers,
      json: { userIds: ["not-a-uuid"] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      json: { userIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "DELETE",
      headers,
      json: { userIds: [randomUUID()] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })
})
