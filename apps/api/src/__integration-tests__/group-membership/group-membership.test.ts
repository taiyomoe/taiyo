import type { GroupMembershipRole, GroupPermission } from "@taiyomoe/db"
import type { Actor, Role } from "@taiyomoe/permissions"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import {
  claimGroup,
  demoteGroupMember,
  leaveGroup,
  promoteGroupMember,
  removeGroupMember,
  transferGroupOwnership,
  updateGroupMemberPermissions,
} from "../../group-membership"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

type SeedMember = [string, GroupMembershipRole] | [string, GroupMembershipRole, GroupPermission[]]

const seedGroup = async (services: Services, members: SeedMember[]) => {
  const groupId = randomUUID()
  const creatorId = (await signInAs(services)).userId

  await services.db
    .insertInto("groups")
    .values({ id: groupId, name: `Group ${groupId}`, creatorId })
    .execute()

  if (members.length > 0) {
    await services.db
      .insertInto("groupMemberships")
      .values(
        members.map(([userId, role, permissions = []]) => ({
          userId,
          groupId,
          role,
          permissions,
          addedBy: creatorId,
        })),
      )
      .execute()
  }

  return groupId
}
const newUser = async (services: Services) => (await signInAs(services)).userId
const actorOf = (id: string, role: Role = "USER") =>
  ({ id, role, banned: false, memberships: [] }) satisfies Actor
const getRoles = async ({ db }: Services, groupId: string) => {
  const rows = await db
    .selectFrom("groupMemberships")
    .select(["userId", "role"])
    .where("groupId", "=", groupId)
    .execute()

  return Object.fromEntries(rows.map((row) => [row.userId, row.role]))
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
const countOwners = async (services: Services, groupId: string) =>
  Object.values(await getRoles(services, groupId)).filter((role) => role === "OWNER").length

describe("group membership", () => {
  test("two owners leaving at the same time leave exactly one owner", async ({ services }) => {
    const a = await newUser(services)
    const b = await newUser(services)
    const groupId = await seedGroup(services, [
      [a, "OWNER"],
      [b, "OWNER"],
    ])
    const results = await Promise.all([
      leaveGroup(services.db, { groupId, userId: a }),
      leaveGroup(services.db, { groupId, userId: b }),
    ])

    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(results).toContainEqual({ ok: false, error: "GROUP_LAST_OWNER" })
    expect(await countOwners(services, groupId)).toBe(1)
  })

  test("two owners stepping down at the same time leave exactly one owner", async ({
    services,
  }) => {
    const a = await newUser(services)
    const b = await newUser(services)
    const groupId = await seedGroup(services, [
      [a, "OWNER"],
      [b, "OWNER"],
    ])
    const results = await Promise.all([
      demoteGroupMember(services.db, { actor: actorOf(a), groupId, userId: a }),
      demoteGroupMember(services.db, { actor: actorOf(b), groupId, userId: b }),
    ])

    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(await countOwners(services, groupId)).toBe(1)
  })

  test("the last owner cannot leave or step down", async ({ services }) => {
    const owner = await newUser(services)
    const member = await newUser(services)
    const groupId = await seedGroup(services, [
      [owner, "OWNER"],
      [member, "MEMBER"],
    ])

    expect(await leaveGroup(services.db, { groupId, userId: owner })).toEqual({
      ok: false,
      error: "GROUP_LAST_OWNER",
    })
    expect(
      await demoteGroupMember(services.db, { actor: actorOf(owner), groupId, userId: owner }),
    ).toEqual({ ok: false, error: "GROUP_LAST_OWNER" })
    expect(await leaveGroup(services.db, { groupId, userId: member })).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
  })

  test("an admin can remove the last owner", async ({ services }) => {
    const owner = await newUser(services)
    const admin = await newUser(services)
    const groupId = await seedGroup(services, [[owner, "OWNER"]])

    expect(
      await removeGroupMember(services.db, {
        actor: actorOf(admin, "ADMIN"),
        groupId,
        userId: owner,
      }),
    ).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({})
  })

  test("owners cannot remove or demote each other", async ({ services }) => {
    const a = await newUser(services)
    const b = await newUser(services)
    const groupId = await seedGroup(services, [
      [a, "OWNER"],
      [b, "OWNER"],
    ])

    expect(await removeGroupMember(services.db, { actor: actorOf(a), groupId, userId: b })).toEqual(
      { ok: false, error: "FORBIDDEN" },
    )
    expect(await demoteGroupMember(services.db, { actor: actorOf(a), groupId, userId: b })).toEqual(
      { ok: false, error: "FORBIDDEN" },
    )
    expect(await countOwners(services, groupId)).toBe(2)
  })

  test("promoting an owner or demoting a member is a no-op", async ({ services }) => {
    const owner = await newUser(services)
    const member = await newUser(services)
    const groupId = await seedGroup(services, [
      [owner, "OWNER"],
      [member, "MEMBER"],
    ])

    expect(
      await promoteGroupMember(services.db, { actor: actorOf(owner), groupId, userId: owner }),
    ).toEqual({ ok: true })
    expect(
      await demoteGroupMember(services.db, { actor: actorOf(owner), groupId, userId: member }),
    ).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER", [member]: "MEMBER" })
  })

  test("promoting keeps the member's stored permissions", async ({ services }) => {
    const owner = await newUser(services)
    const member = await newUser(services)
    const groupId = await seedGroup(services, [
      [owner, "OWNER"],
      [member, "MEMBER", ["EDIT_CHAPTERS"]],
    ])

    expect(
      await promoteGroupMember(services.db, { actor: actorOf(owner), groupId, userId: member }),
    ).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER", [member]: "OWNER" })
    expect(await getPermissions(services, groupId, member)).toEqual(["EDIT_CHAPTERS"])
  })

  test("operations on a non-member report GROUP_MEMBER_NOT_FOUND", async ({ services }) => {
    const owner = await newUser(services)
    const groupId = await seedGroup(services, [[owner, "OWNER"]])
    const stranger = await newUser(services)
    const actor = actorOf(owner)

    expect(await removeGroupMember(services.db, { actor, groupId, userId: stranger })).toEqual({
      ok: false,
      error: "GROUP_MEMBER_NOT_FOUND",
    })
    expect(await promoteGroupMember(services.db, { actor, groupId, userId: stranger })).toEqual({
      ok: false,
      error: "GROUP_MEMBER_NOT_FOUND",
    })
    expect(
      await updateGroupMemberPermissions(services.db, {
        actor,
        groupId,
        userId: stranger,
        permissions: [],
      }),
    ).toEqual({ ok: false, error: "GROUP_MEMBER_NOT_FOUND" })
    expect(await leaveGroup(services.db, { groupId, userId: stranger })).toEqual({
      ok: false,
      error: "GROUP_MEMBER_NOT_FOUND",
    })
  })

  test("operations on a deleted group report GROUP_NOT_FOUND", async ({ services }) => {
    const owner = await newUser(services)
    const member = await newUser(services)
    const groupId = await seedGroup(services, [
      [owner, "OWNER"],
      [member, "MEMBER"],
    ])

    await services.db
      .updateTable("groups")
      .set({ deletedAt: new Date() })
      .where("id", "=", groupId)
      .execute()

    expect(
      await removeGroupMember(services.db, { actor: actorOf(owner), groupId, userId: member }),
    ).toEqual({ ok: false, error: "GROUP_NOT_FOUND" })
    expect(await leaveGroup(services.db, { groupId, userId: member })).toEqual({
      ok: false,
      error: "GROUP_NOT_FOUND",
    })
  })

  describe("permissions", () => {
    test("checks the manager's permissions as they are inside the lock", async ({ services }) => {
      const owner = await newUser(services)
      const manager = await newUser(services)
      const member = await newUser(services)
      const groupId = await seedGroup(services, [
        [owner, "OWNER"],
        [manager, "MEMBER", ["MANAGE_MEMBERS", "EDIT_CHAPTERS"]],
        [member, "MEMBER", ["EDIT_CHAPTERS"]],
      ])
      const staleActor: Actor = {
        ...actorOf(manager),
        memberships: [
          { groupId, role: "MEMBER", permissions: ["MANAGE_MEMBERS", "EDIT_CHAPTERS"] },
        ],
      }

      expect(
        await updateGroupMemberPermissions(services.db, {
          actor: actorOf(owner),
          groupId,
          userId: manager,
          permissions: ["EDIT_CHAPTERS"],
        }),
      ).toEqual({ ok: true })
      expect(
        await removeGroupMember(services.db, { actor: staleActor, groupId, userId: member }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
      expect(
        await updateGroupMemberPermissions(services.db, {
          actor: staleActor,
          groupId,
          userId: member,
          permissions: [],
        }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
      expect(await getRoles(services, groupId)).toHaveProperty(member, "MEMBER")
    })

    test("a manager cannot grant what they do not hold", async ({ services }) => {
      const manager = await newUser(services)
      const member = await newUser(services)
      const groupId = await seedGroup(services, [
        [manager, "MEMBER", ["MANAGE_MEMBERS", "UPLOAD_CHAPTERS"]],
        [member, "MEMBER"],
      ])
      const actor = actorOf(manager)

      expect(
        await updateGroupMemberPermissions(services.db, {
          actor,
          groupId,
          userId: member,
          permissions: ["UPLOAD_CHAPTERS", "DELETE_CHAPTERS"],
        }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
      expect(
        await updateGroupMemberPermissions(services.db, {
          actor,
          groupId,
          userId: member,
          permissions: ["UPLOAD_CHAPTERS"],
        }),
      ).toEqual({ ok: true })
      expect(await getPermissions(services, groupId, member)).toEqual(["UPLOAD_CHAPTERS"])
    })

    test("a regular member cannot change anyone's permissions", async ({ services }) => {
      const a = await newUser(services)
      const b = await newUser(services)
      const groupId = await seedGroup(services, [
        [a, "MEMBER", ["UPLOAD_CHAPTERS", "EDIT_CHAPTERS", "DELETE_CHAPTERS", "EDIT_GROUP"]],
        [b, "MEMBER"],
      ])

      expect(
        await updateGroupMemberPermissions(services.db, {
          actor: actorOf(a),
          groupId,
          userId: b,
          permissions: ["EDIT_CHAPTERS"],
        }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
      expect(
        await updateGroupMemberPermissions(services.db, {
          actor: actorOf(a),
          groupId,
          userId: a,
          permissions: ["MANAGE_MEMBERS"],
        }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
    })
  })

  describe("claim", () => {
    test("makes the claimant the owner of an unowned group", async ({ services }) => {
      const groupId = await seedGroup(services, [])
      const claimant = await newUser(services)

      expect(
        await claimGroup(services.db, { groupId, userId: claimant, addedBy: claimant }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [claimant]: "OWNER" })
    })

    test("promotes a claimant who is already a member", async ({ services }) => {
      const claimant = await newUser(services)
      const groupId = await seedGroup(services, [[claimant, "MEMBER"]])

      expect(
        await claimGroup(services.db, { groupId, userId: claimant, addedBy: claimant }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [claimant]: "OWNER" })
    })

    test("two claims at the same time produce one owner", async ({ services }) => {
      const groupId = await seedGroup(services, [])
      const a = await newUser(services)
      const b = await newUser(services)
      const results = await Promise.all([
        claimGroup(services.db, { groupId, userId: a, addedBy: a }),
        claimGroup(services.db, { groupId, userId: b, addedBy: b }),
      ])

      expect(results).toContainEqual({ ok: true })
      expect(results).toContainEqual({ ok: false, error: "GROUP_ALREADY_OWNED" })
      expect(await countOwners(services, groupId)).toBe(1)
    })
  })

  describe("transfer", () => {
    test("promotes the target and demotes the caller", async ({ services }) => {
      const owner = await newUser(services)
      const member = await newUser(services)
      const groupId = await seedGroup(services, [
        [owner, "OWNER"],
        [member, "MEMBER"],
      ])

      expect(
        await transferGroupOwnership(services.db, {
          actor: actorOf(owner),
          groupId,
          toUserId: member,
        }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [owner]: "MEMBER", [member]: "OWNER" })
    })

    test("only demotes the caller when the target already owns the group", async ({ services }) => {
      const a = await newUser(services)
      const b = await newUser(services)
      const groupId = await seedGroup(services, [
        [a, "OWNER"],
        [b, "OWNER"],
      ])

      expect(
        await transferGroupOwnership(services.db, { actor: actorOf(a), groupId, toUserId: b }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [a]: "MEMBER", [b]: "OWNER" })
    })

    test("refuses a caller who is not an owner", async ({ services }) => {
      const owner = await newUser(services)
      const member = await newUser(services)
      const groupId = await seedGroup(services, [
        [owner, "OWNER"],
        [member, "MEMBER", ["MANAGE_MEMBERS"]],
      ])

      expect(
        await transferGroupOwnership(services.db, {
          actor: actorOf(member),
          groupId,
          toUserId: owner,
        }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
    })

    test("refuses a target who is not a member", async ({ services }) => {
      const owner = await newUser(services)
      const stranger = await newUser(services)
      const groupId = await seedGroup(services, [[owner, "OWNER"]])

      expect(
        await transferGroupOwnership(services.db, {
          actor: actorOf(owner),
          groupId,
          toUserId: stranger,
        }),
      ).toEqual({ ok: false, error: "GROUP_MEMBER_NOT_FOUND" })
      expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
    })

    test("transferring to yourself changes nothing", async ({ services }) => {
      const owner = await newUser(services)
      const groupId = await seedGroup(services, [[owner, "OWNER"]])

      expect(
        await transferGroupOwnership(services.db, {
          actor: actorOf(owner),
          groupId,
          toUserId: owner,
        }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
    })
  })
})
