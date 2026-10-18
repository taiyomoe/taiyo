import type { DB, GroupMembershipRole, GroupPermission, Kysely } from "@taiyomoe/db"
import { type Actor, createPermissions, GROUP_PERMISSIONS } from "@taiyomoe/permissions"

type Result<E extends string> = { ok: true } | { ok: false; error: E }

const withGroupLock = <T>(
  db: Kysely<DB>,
  groupId: string,
  fn: (trx: Kysely<DB>) => Promise<T>,
): Promise<T | { ok: false; error: "GROUP_NOT_FOUND" }> => {
  const run = async (trx: Kysely<DB>) => {
    const group = await trx
      .selectFrom("groups")
      .select("id")
      .where("id", "=", groupId)
      .where("deletedAt", "is", null)
      .forUpdate()
      .executeTakeFirst()

    if (group === undefined) {
      return { ok: false as const, error: "GROUP_NOT_FOUND" as const }
    }

    return fn(trx)
  }

  return db.isTransaction ? run(db) : db.transaction().execute(run)
}
const getMembership = (trx: Kysely<DB>, groupId: string, userId: string) =>
  trx
    .selectFrom("groupMemberships")
    .select(["groupId", "userId", "role", "permissions"])
    .where("groupId", "=", groupId)
    .where("userId", "=", userId)
    .executeTakeFirst()
const getLockedPermissions = async (trx: Kysely<DB>, actor: Actor, groupId: string) => {
  const own = await getMembership(trx, groupId, actor.id)

  return createPermissions({ ...actor, memberships: own === undefined ? [] : [own] })
}
const hasOtherOwner = async (trx: Kysely<DB>, groupId: string, userId: string) => {
  const row = await trx
    .selectFrom("groupMemberships")
    .select("userId")
    .where("groupId", "=", groupId)
    .where("role", "=", "OWNER")
    .where("userId", "!=", userId)
    .limit(1)
    .executeTakeFirst()

  return row !== undefined
}
const updateRole = async (
  trx: Kysely<DB>,
  groupId: string,
  userId: string,
  role: GroupMembershipRole,
) => {
  await trx
    .updateTable("groupMemberships")
    .set({ role })
    .where("groupId", "=", groupId)
    .where("userId", "=", userId)
    .execute()
}

export const normalizeGroupPermissions = (permissions: readonly GroupPermission[]) =>
  GROUP_PERMISSIONS.filter((permission) => permissions.includes(permission))

export const addGroupMember = (
  db: Kysely<DB>,
  {
    groupId,
    userId,
    role,
    permissions,
    addedBy,
  }: {
    groupId: string
    userId: string
    role: GroupMembershipRole
    permissions: readonly GroupPermission[]
    addedBy: string
  },
): Promise<Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_EXISTS">> =>
  withGroupLock(db, groupId, async (trx) => {
    if ((await getMembership(trx, groupId, userId)) !== undefined) {
      return { ok: false, error: "GROUP_MEMBER_EXISTS" }
    }

    await trx
      .insertInto("groupMemberships")
      .values({
        groupId,
        userId,
        role,
        permissions: normalizeGroupPermissions(permissions),
        addedBy,
      })
      .execute()

    return { ok: true }
  })

export const updateGroupMemberPermissions = (
  db: Kysely<DB>,
  {
    actor,
    groupId,
    userId,
    permissions,
  }: { actor: Actor; groupId: string; userId: string; permissions: readonly GroupPermission[] },
): Promise<Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_NOT_FOUND" | "FORBIDDEN">> =>
  withGroupLock(db, groupId, async (trx) => {
    const member = await getMembership(trx, groupId, userId)

    if (member === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    const can = await getLockedPermissions(trx, actor, groupId)
    const next = normalizeGroupPermissions(permissions)

    if (!can("group.updateMember", { member, permissions: next })) {
      return { ok: false, error: "FORBIDDEN" }
    }

    await trx
      .updateTable("groupMemberships")
      .set({ permissions: next })
      .where("groupId", "=", groupId)
      .where("userId", "=", userId)
      .execute()

    return { ok: true }
  })

export const promoteGroupMember = (
  db: Kysely<DB>,
  { actor, groupId, userId }: { actor: Actor; groupId: string; userId: string },
): Promise<Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_NOT_FOUND" | "FORBIDDEN">> =>
  withGroupLock(db, groupId, async (trx) => {
    const member = await getMembership(trx, groupId, userId)

    if (member === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (member.role === "OWNER") {
      return { ok: true }
    }

    const can = await getLockedPermissions(trx, actor, groupId)

    if (!can("group.promoteMember", member)) {
      return { ok: false, error: "FORBIDDEN" }
    }

    await updateRole(trx, groupId, userId, "OWNER")

    return { ok: true }
  })

export const demoteGroupMember = (
  db: Kysely<DB>,
  { actor, groupId, userId }: { actor: Actor; groupId: string; userId: string },
): Promise<
  Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_NOT_FOUND" | "GROUP_LAST_OWNER" | "FORBIDDEN">
> =>
  withGroupLock(db, groupId, async (trx) => {
    const member = await getMembership(trx, groupId, userId)

    if (member === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (member.role === "MEMBER") {
      return { ok: true }
    }

    const can = await getLockedPermissions(trx, actor, groupId)

    if (!can("group.demoteMember", member)) {
      return { ok: false, error: "FORBIDDEN" }
    }

    if (actor.role !== "ADMIN" && !(await hasOtherOwner(trx, groupId, userId))) {
      return { ok: false, error: "GROUP_LAST_OWNER" }
    }

    await updateRole(trx, groupId, userId, "MEMBER")

    return { ok: true }
  })

export const removeGroupMember = (
  db: Kysely<DB>,
  { actor, groupId, userId }: { actor: Actor; groupId: string; userId: string },
): Promise<
  Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_NOT_FOUND" | "GROUP_LAST_OWNER" | "FORBIDDEN">
> =>
  withGroupLock(db, groupId, async (trx) => {
    const member = await getMembership(trx, groupId, userId)

    if (member === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    const can = await getLockedPermissions(trx, actor, groupId)

    if (!can("group.removeMember", member)) {
      return { ok: false, error: "FORBIDDEN" }
    }

    if (
      member.role === "OWNER" &&
      actor.role !== "ADMIN" &&
      !(await hasOtherOwner(trx, groupId, userId))
    ) {
      return { ok: false, error: "GROUP_LAST_OWNER" }
    }

    await trx
      .deleteFrom("groupMemberships")
      .where("groupId", "=", groupId)
      .where("userId", "=", userId)
      .execute()

    return { ok: true }
  })

export const leaveGroup = (
  db: Kysely<DB>,
  { groupId, userId }: { groupId: string; userId: string },
): Promise<Result<"GROUP_NOT_FOUND" | "GROUP_MEMBER_NOT_FOUND" | "GROUP_LAST_OWNER">> =>
  withGroupLock(db, groupId, async (trx) => {
    const member = await getMembership(trx, groupId, userId)

    if (member === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (member.role === "OWNER" && !(await hasOtherOwner(trx, groupId, userId))) {
      return { ok: false, error: "GROUP_LAST_OWNER" }
    }

    await trx
      .deleteFrom("groupMemberships")
      .where("groupId", "=", groupId)
      .where("userId", "=", userId)
      .execute()

    return { ok: true }
  })

export const transferGroupOwnership = (
  db: Kysely<DB>,
  { actor, groupId, toUserId }: { actor: Actor; groupId: string; toUserId: string },
): Promise<Result<"GROUP_NOT_FOUND" | "FORBIDDEN" | "GROUP_MEMBER_NOT_FOUND">> =>
  withGroupLock(db, groupId, async (trx) => {
    const can = await getLockedPermissions(trx, actor, groupId)

    if (!can("group.transferOwnership", { id: groupId })) {
      return { ok: false, error: "FORBIDDEN" }
    }

    if (actor.id === toUserId) {
      return { ok: true }
    }

    const target = await getMembership(trx, groupId, toUserId)

    if (target === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (target.role !== "OWNER") {
      await updateRole(trx, groupId, toUserId, "OWNER")
    }

    await updateRole(trx, groupId, actor.id, "MEMBER")

    return { ok: true }
  })

export const claimGroup = (
  db: Kysely<DB>,
  { groupId, userId, addedBy }: { groupId: string; userId: string; addedBy: string },
): Promise<Result<"GROUP_NOT_FOUND" | "GROUP_ALREADY_OWNED">> =>
  withGroupLock(db, groupId, async (trx) => {
    const owner = await trx
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", groupId)
      .where("role", "=", "OWNER")
      .limit(1)
      .executeTakeFirst()

    if (owner !== undefined) {
      return { ok: false, error: "GROUP_ALREADY_OWNED" }
    }

    await trx
      .insertInto("groupMemberships")
      .values({ groupId, userId, role: "OWNER", addedBy })
      .onConflict((oc) => oc.columns(["userId", "groupId"]).doUpdateSet({ role: "OWNER" }))
      .execute()

    return { ok: true }
  })
