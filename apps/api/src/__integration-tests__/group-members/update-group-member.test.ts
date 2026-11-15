import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup } from "../helpers/seed"
import { test } from "../setup"

const addMember = async (
  { db }: Services,
  groupId: string,
  userId: string,
  role: GroupMembershipRole,
  permissions: GroupPermission[] = [],
) => {
  await db
    .insertInto("groupMemberships")
    .values({ groupId, userId, role, permissions, addedBy: userId })
    .execute()
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
const setup = async (services: Services) => {
  const owner = await signInAs(services)
  const target = await signInAs(services)
  const groupId = await seedGroup(services, owner.userId, `Group ${randomUUID()}`)

  await addMember(services, groupId, owner.userId, "OWNER")
  await addMember(services, groupId, target.userId, "MEMBER")

  return { owner, target, groupId }
}

describe("PATCH /groups/:id/members/:userId", () => {
  test("an owner can set a member's permissions", async ({ app, services }) => {
    const { owner, target, groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: ["MANAGE_MEMBERS", "EDIT_GROUP", "UPLOAD_CHAPTERS", "EDIT_GROUP"] },
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { permissions: ["UPLOAD_CHAPTERS", "EDIT_GROUP", "MANAGE_MEMBERS"] },
    })
    expect(await getPermissions(services, groupId, target.userId)).toEqual([
      "UPLOAD_CHAPTERS",
      "EDIT_GROUP",
      "MANAGE_MEMBERS",
    ])
  })

  test("a granted permission takes effect on the next request", async ({ app, services }) => {
    const { owner, target, groupId } = await setup(services)
    const edit = () =>
      api(app, `/groups/${groupId}`, {
        method: "PATCH",
        headers: target.headers,
        json: { description: "By a member" },
      })

    expect((await edit()).status).toBe(403)

    await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: ["EDIT_GROUP"] },
    })

    expect((await edit()).status).toBe(200)

    await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: [] },
    })

    expect((await edit()).status).toBe(403)
  })

  test("a manager can only grant permissions they hold", async ({ app, services }) => {
    const { target, groupId } = await setup(services)
    const manager = await signInAs(services)

    await addMember(services, groupId, manager.userId, "MEMBER", [
      "MANAGE_MEMBERS",
      "UPLOAD_CHAPTERS",
    ])

    const escalate = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: manager.headers,
      json: { permissions: ["UPLOAD_CHAPTERS", "DELETE_CHAPTERS"] },
    })
    const delegate = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: manager.headers,
      json: { permissions: ["MANAGE_MEMBERS"] },
    })
    const grant = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: manager.headers,
      json: { permissions: ["UPLOAD_CHAPTERS"] },
    })

    expect(escalate.status).toBe(403)
    expect(delegate.status).toBe(403)
    expect(grant.status).toBe(200)
    expect(await getPermissions(services, groupId, target.userId)).toEqual(["UPLOAD_CHAPTERS"])
  })

  test("a manager cannot raise their own permissions", async ({ app, services }) => {
    const { groupId } = await setup(services)
    const manager = await signInAs(services)

    await addMember(services, groupId, manager.userId, "MEMBER", ["MANAGE_MEMBERS"])

    const res = await api(app, `/groups/${groupId}/members/${manager.userId}`, {
      method: "PATCH",
      headers: manager.headers,
      json: { permissions: ["MANAGE_MEMBERS", "DELETE_CHAPTERS"] },
    })

    expect(res.status).toBe(403)
    expect(await getPermissions(services, groupId, manager.userId)).toEqual(["MANAGE_MEMBERS"])
  })

  test("an owner cannot change another owner's permissions", async ({ app, services }) => {
    const { owner, groupId } = await setup(services)
    const coOwner = await signInAs(services)

    await addMember(services, groupId, coOwner.userId, "OWNER")

    const res = await api(app, `/groups/${groupId}/members/${coOwner.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: ["EDIT_GROUP"] },
    })

    expect(res.status).toBe(403)
  })

  test("members without MANAGE_MEMBERS and outsiders are refused", async ({ app, services }) => {
    const { target, groupId } = await setup(services)
    const editor = await signInAs(services)

    await addMember(services, groupId, editor.userId, "MEMBER", [
      "UPLOAD_CHAPTERS",
      "EDIT_CHAPTERS",
      "DELETE_CHAPTERS",
      "EDIT_GROUP",
    ])

    const outsiders = await Promise.all(
      (["USER", "UPLOADER_INTERN", "UPLOADER", "MODERATOR"] as const).map(
        async (role) => (await signInAs(services, { role })).headers,
      ),
    )

    for (const headers of [editor.headers, ...outsiders]) {
      const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
        method: "PATCH",
        headers,
        json: { permissions: ["EDIT_CHAPTERS"] },
      })

      expect(res.status).toBe(403)
    }

    expect(await getPermissions(services, groupId, target.userId)).toEqual([])
  })

  test("an admin can change anyone's permissions", async ({ app, services }) => {
    const { target, groupId } = await setup(services)
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers,
      json: { permissions: ["DELETE_CHAPTERS"] },
    })

    expect(res.status).toBe(200)
    expect(await getPermissions(services, groupId, target.userId)).toEqual(["DELETE_CHAPTERS"])
  })

  test("a banned owner is refused", async ({ app, services }) => {
    const { owner, target, groupId } = await setup(services)

    await services.db
      .updateTable("users")
      .set({ banned: true })
      .where("id", "=", owner.userId)
      .execute()

    const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: ["EDIT_CHAPTERS"] },
    })

    expect(res.status).toBe(403)
  })

  test("returns GROUP_MEMBER_NOT_FOUND for a non-member", async ({ app, services }) => {
    const { owner, groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members/${randomUUID()}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: [] },
    })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, code: "GROUP_MEMBER_NOT_FOUND" })
  })

  test("returns VALIDATION_ERROR for an unknown permission", async ({ app, services }) => {
    const { owner, target, groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      headers: owner.headers,
      json: { permissions: ["DELETE_GROUP"] },
    })

    expect(res.status).toBe(422)
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app, services }) => {
    const { target, groupId } = await setup(services)
    const res = await api(app, `/groups/${groupId}/members/${target.userId}`, {
      method: "PATCH",
      json: { permissions: [] },
    })

    expect(res.status).toBe(401)
  })
})
