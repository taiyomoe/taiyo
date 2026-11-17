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
const getPermissions = async ({ db }: Services, groupId: string, userId: string) => {
  const row = await db
    .selectFrom("groupMemberships")
    .select("permissions")
    .where("groupId", "=", groupId)
    .where("userId", "=", userId)
    .executeTakeFirstOrThrow()

  return row.permissions
}
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /groups/:id/members", () => {
  test("grants and revokes on every member, keeping their other permissions", async ({
    app,
    services,
  }) => {
    const { groupId, owner } = await setup(services)
    const first = await addMember(services, groupId, "MEMBER", ["EDIT_GROUP", "DELETE_CHAPTERS"])
    const second = await addMember(services, groupId, "MEMBER")
    const coOwner = await addMember(services, groupId, "OWNER")
    const stranger = randomUUID()
    const res = await api<BulkResult>(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      headers: owner.headers,
      json: {
        userIds: [first.userId, second.userId, coOwner.userId, stranger],
        grant: ["UPLOAD_CHAPTERS"],
        revoke: ["DELETE_CHAPTERS"],
      },
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      done: [first.userId, second.userId],
      skipped: [
        { id: coOwner.userId, reason: "FORBIDDEN" },
        { id: stranger, reason: "NOT_FOUND" },
      ],
    })
    expect(await getPermissions(services, groupId, first.userId)).toEqual([
      "UPLOAD_CHAPTERS",
      "EDIT_GROUP",
    ])
    expect(await getPermissions(services, groupId, second.userId)).toEqual(["UPLOAD_CHAPTERS"])
    expect(await getPermissions(services, groupId, coOwner.userId)).toEqual([])

    const [log] = await findAuditLogs(services, "group.member.UPDATE_MANY")

    expect(log?.event).toMatchObject({
      audit: {
        target: { type: "group", id: groupId },
        changes: {
          before: { permissions: { [first.userId]: ["EDIT_GROUP", "DELETE_CHAPTERS"] } },
          after: {
            userIds: [first.userId, second.userId],
            grant: ["UPLOAD_CHAPTERS"],
            revoke: ["DELETE_CHAPTERS"],
          },
        },
      },
    })
  })

  test("skips the members a manager cannot give the permissions to", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const manager = await addMember(services, groupId, "MEMBER", [
      "MANAGE_MEMBERS",
      "UPLOAD_CHAPTERS",
    ])
    const member = await addMember(services, groupId, "MEMBER")
    const stronger = await addMember(services, groupId, "MEMBER", ["DELETE_CHAPTERS"])
    const res = await api<BulkResult>(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      headers: manager.headers,
      json: { userIds: [member.userId, stronger.userId], grant: ["UPLOAD_CHAPTERS"] },
    })

    expect(res.body.success && res.body.data).toEqual({
      done: [member.userId],
      skipped: [{ id: stronger.userId, reason: "FORBIDDEN" }],
    })
    expect(await getPermissions(services, groupId, stronger.userId)).toEqual(["DELETE_CHAPTERS"])
  })

  test("returns FORBIDDEN for a member who cannot manage members", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const member = await addMember(services, groupId, "MEMBER", ["EDIT_GROUP"])
    const target = await addMember(services, groupId, "MEMBER")
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      headers: member.headers,
      json: { userIds: [target.userId], grant: ["EDIT_GROUP"] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("returns GROUP_NOT_FOUND for an unknown group", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${randomUUID()}/members`, {
      method: "PATCH",
      headers,
      json: { userIds: [randomUUID()], grant: ["EDIT_GROUP"] },
    })

    expectFailure(res, 404, "GROUP_NOT_FOUND")
  })

  test("returns VALIDATION_ERROR when nothing is granted or revoked", async ({ app, services }) => {
    const { groupId, owner } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      headers: owner.headers,
      json: { userIds: [randomUUID()] },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      json: { userIds: [randomUUID()], grant: ["EDIT_GROUP"] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const { headers } = await signInAs(services, { banned: true })
    const res = await api(app, `/groups/${groupId}/members`, {
      method: "PATCH",
      headers,
      json: { userIds: [randomUUID()], grant: ["EDIT_GROUP"] },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })
})
