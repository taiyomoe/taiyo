import type { DB, GroupMembershipRole, Kysely } from "@taiyomoe/db"

type Result<E extends string> = { ok: true } | { ok: false; error: E }

const withGroupLock = <T>(db: Kysely<DB>, groupId: string, fn: (trx: Kysely<DB>) => Promise<T>) => {
  const run = async (trx: Kysely<DB>) => {
    await trx.selectFrom("groups").select("id").where("id", "=", groupId).forUpdate().execute()

    return fn(trx)
  }

  return db.isTransaction ? run(db) : db.transaction().execute(run)
}
const getRole = async (trx: Kysely<DB>, groupId: string, userId: string) => {
  const row = await trx
    .selectFrom("groupMemberships")
    .select("role")
    .where("groupId", "=", groupId)
    .where("userId", "=", userId)
    .executeTakeFirst()

  return row?.role
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

export const addGroupMember = (
  db: Kysely<DB>,
  {
    groupId,
    userId,
    role,
    addedBy,
  }: { groupId: string; userId: string; role: GroupMembershipRole; addedBy: string },
): Promise<Result<"GROUP_MEMBER_EXISTS">> =>
  withGroupLock(db, groupId, async (trx) => {
    if ((await getRole(trx, groupId, userId)) !== undefined) {
      return { ok: false, error: "GROUP_MEMBER_EXISTS" }
    }

    await trx.insertInto("groupMemberships").values({ groupId, userId, role, addedBy }).execute()

    return { ok: true }
  })

export const setGroupMemberRole = (
  db: Kysely<DB>,
  { groupId, userId, role }: { groupId: string; userId: string; role: GroupMembershipRole },
): Promise<Result<"GROUP_MEMBER_NOT_FOUND" | "GROUP_LAST_OWNER">> =>
  withGroupLock(db, groupId, async (trx) => {
    const current = await getRole(trx, groupId, userId)

    if (current === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (current === role) {
      return { ok: true }
    }

    if (current === "OWNER" && !(await hasOtherOwner(trx, groupId, userId))) {
      return { ok: false, error: "GROUP_LAST_OWNER" }
    }

    await updateRole(trx, groupId, userId, role)

    return { ok: true }
  })

export const removeGroupMember = (
  db: Kysely<DB>,
  { groupId, userId }: { groupId: string; userId: string },
): Promise<Result<"GROUP_MEMBER_NOT_FOUND" | "GROUP_LAST_OWNER">> =>
  withGroupLock(db, groupId, async (trx) => {
    const current = await getRole(trx, groupId, userId)

    if (current === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (current === "OWNER" && !(await hasOtherOwner(trx, groupId, userId))) {
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
  { groupId, fromUserId, toUserId }: { groupId: string; fromUserId: string; toUserId: string },
): Promise<Result<"FORBIDDEN" | "GROUP_MEMBER_NOT_FOUND">> =>
  withGroupLock(db, groupId, async (trx) => {
    if ((await getRole(trx, groupId, fromUserId)) !== "OWNER") {
      return { ok: false, error: "FORBIDDEN" }
    }

    if (fromUserId === toUserId) {
      return { ok: true }
    }

    const target = await getRole(trx, groupId, toUserId)

    if (target === undefined) {
      return { ok: false, error: "GROUP_MEMBER_NOT_FOUND" }
    }

    if (target !== "OWNER") {
      await updateRole(trx, groupId, toUserId, "OWNER")
    }

    await updateRole(trx, groupId, fromUserId, "MEMBER")

    return { ok: true }
  })

export const claimGroup = (
  db: Kysely<DB>,
  { groupId, userId, addedBy }: { groupId: string; userId: string; addedBy: string },
): Promise<Result<"GROUP_ALREADY_OWNED">> =>
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
