import type { GroupMembershipRole } from "@taiyomoe/db"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import {
  addGroupMember,
  claimGroup,
  removeGroupMember,
  setGroupMemberRole,
  transferGroupOwnership,
} from "../../group-membership"
import { signInAs } from "../helpers/auth"
import { test } from "../setup"

const seedGroup = async (services: Services, members: Array<[string, GroupMembershipRole]>) => {
  const groupId = randomUUID()
  const creatorId = (await signInAs(services)).userId

  await services.db
    .insertInto("groups")
    .values({ id: groupId, name: `Group ${groupId}`, creatorId })
    .execute()

  if (members.length > 0) {
    await services.db
      .insertInto("groupMemberships")
      .values(members.map(([userId, role]) => ({ userId, groupId, role, addedBy: creatorId })))
      .execute()
  }

  return groupId
}
const newUser = async (services: Services) => (await signInAs(services)).userId
const getRoles = async ({ db }: Services, groupId: string) => {
  const rows = await db
    .selectFrom("groupMemberships")
    .select(["userId", "role"])
    .where("groupId", "=", groupId)
    .execute()

  return Object.fromEntries(rows.map((row) => [row.userId, row.role]))
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
      removeGroupMember(services.db, { groupId, userId: a }),
      removeGroupMember(services.db, { groupId, userId: b }),
    ])

    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(results).toContainEqual({ ok: false, error: "GROUP_LAST_OWNER" })
    expect(await countOwners(services, groupId)).toBe(1)
  })

  test("two owners demoting each other at the same time leave exactly one owner", async ({
    services,
  }) => {
    const a = await newUser(services)
    const b = await newUser(services)
    const groupId = await seedGroup(services, [
      [a, "OWNER"],
      [b, "OWNER"],
    ])
    const results = await Promise.all([
      setGroupMemberRole(services.db, { groupId, userId: a, role: "MEMBER" }),
      setGroupMemberRole(services.db, { groupId, userId: b, role: "MEMBER" }),
    ])

    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(await countOwners(services, groupId)).toBe(1)
  })

  test("removing or demoting the last owner is refused", async ({ services }) => {
    const owner = await newUser(services)
    const member = await newUser(services)
    const groupId = await seedGroup(services, [
      [owner, "OWNER"],
      [member, "MEMBER"],
    ])

    expect(await removeGroupMember(services.db, { groupId, userId: owner })).toEqual({
      ok: false,
      error: "GROUP_LAST_OWNER",
    })
    expect(
      await setGroupMemberRole(services.db, { groupId, userId: owner, role: "MEMBER" }),
    ).toEqual({ ok: false, error: "GROUP_LAST_OWNER" })
    expect(await removeGroupMember(services.db, { groupId, userId: member })).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
  })

  test("setting a member's current role is a no-op", async ({ services }) => {
    const owner = await newUser(services)
    const groupId = await seedGroup(services, [[owner, "OWNER"]])

    expect(
      await setGroupMemberRole(services.db, { groupId, userId: owner, role: "OWNER" }),
    ).toEqual({ ok: true })
    expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
  })

  test("operations on a non-member report GROUP_MEMBER_NOT_FOUND", async ({ services }) => {
    const groupId = await seedGroup(services, [])
    const stranger = await newUser(services)

    expect(await removeGroupMember(services.db, { groupId, userId: stranger })).toEqual({
      ok: false,
      error: "GROUP_MEMBER_NOT_FOUND",
    })
    expect(
      await setGroupMemberRole(services.db, { groupId, userId: stranger, role: "OWNER" }),
    ).toEqual({ ok: false, error: "GROUP_MEMBER_NOT_FOUND" })
  })

  test("adding the same user twice at the same time adds them once", async ({ services }) => {
    const groupId = await seedGroup(services, [])
    const user = await newUser(services)
    const input = { groupId, userId: user, role: "MEMBER" as const, addedBy: user }
    const results = await Promise.all([
      addGroupMember(services.db, input),
      addGroupMember(services.db, input),
    ])

    expect(results).toContainEqual({ ok: true })
    expect(results).toContainEqual({ ok: false, error: "GROUP_MEMBER_EXISTS" })
    expect(await getRoles(services, groupId)).toEqual({ [user]: "MEMBER" })
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
        await transferGroupOwnership(services.db, { groupId, fromUserId: owner, toUserId: member }),
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
        await transferGroupOwnership(services.db, { groupId, fromUserId: a, toUserId: b }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [a]: "MEMBER", [b]: "OWNER" })
    })

    test("refuses a caller who is not an owner", async ({ services }) => {
      const owner = await newUser(services)
      const member = await newUser(services)
      const groupId = await seedGroup(services, [
        [owner, "OWNER"],
        [member, "MEMBER"],
      ])

      expect(
        await transferGroupOwnership(services.db, { groupId, fromUserId: member, toUserId: owner }),
      ).toEqual({ ok: false, error: "FORBIDDEN" })
    })

    test("refuses a target who is not a member", async ({ services }) => {
      const owner = await newUser(services)
      const stranger = await newUser(services)
      const groupId = await seedGroup(services, [[owner, "OWNER"]])

      expect(
        await transferGroupOwnership(services.db, {
          groupId,
          fromUserId: owner,
          toUserId: stranger,
        }),
      ).toEqual({ ok: false, error: "GROUP_MEMBER_NOT_FOUND" })
      expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
    })

    test("transferring to yourself changes nothing", async ({ services }) => {
      const owner = await newUser(services)
      const groupId = await seedGroup(services, [[owner, "OWNER"]])

      expect(
        await transferGroupOwnership(services.db, { groupId, fromUserId: owner, toUserId: owner }),
      ).toEqual({ ok: true })
      expect(await getRoles(services, groupId)).toEqual({ [owner]: "OWNER" })
    })
  })
})
