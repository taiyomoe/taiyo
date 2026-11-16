import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { createPermissions, toRole } from "@taiyomoe/permissions"
import { getMembership, normalizeGroupPermissions, withGroupLock } from "../group-membership"

/**
 * Joins the group with the permissions the invitation grants, as long as it has not expired
 * and its sender can still grant them.
 */
export const acceptGroupInvitation = async (
  db: Kysely<DB>,
  { invitationId, userId }: { invitationId: string; userId: string },
) => {
  const found = await db
    .selectFrom("groupInvitations")
    .select("groupId")
    .where("id", "=", invitationId)
    .where("inviteeId", "=", userId)
    .executeTakeFirst()

  if (found === undefined) {
    return { ok: false, error: "GROUP_INVITATION_NOT_FOUND", groupId: null } as const
  }

  const { groupId } = found
  const result = await withGroupLock(db, groupId, async (trx) => {
    const invitation = await trx
      .selectFrom("groupInvitations")
      .select([
        "inviterId",
        "permissions",
        "status",
        sql<boolean>`"expiresAt" <= CURRENT_TIMESTAMP`.as("expired"),
      ])
      .where("id", "=", invitationId)
      .executeTakeFirstOrThrow()

    if (invitation.status !== "PENDING") {
      return { ok: false, error: "GROUP_INVITATION_NOT_PENDING" } as const
    }

    if (invitation.expired) {
      return { ok: false, error: "GROUP_INVITATION_EXPIRED" } as const
    }

    const [inviter, inviterMembership] = await Promise.all([
      trx
        .selectFrom("users")
        .select(["role", "banned"])
        .where("id", "=", invitation.inviterId)
        .executeTakeFirst(),
      getMembership(trx, groupId, invitation.inviterId),
    ])

    if (
      inviter === undefined ||
      !createPermissions({
        id: invitation.inviterId,
        role: toRole(inviter.role),
        banned: inviter.banned === true,
        memberships: inviterMembership === undefined ? [] : [inviterMembership],
      })("group.inviteMember", { groupId, permissions: invitation.permissions })
    ) {
      return { ok: false, error: "GROUP_INVITATION_INVALID" } as const
    }

    if ((await getMembership(trx, groupId, userId)) !== undefined) {
      return { ok: false, error: "GROUP_MEMBER_EXISTS" } as const
    }

    await trx
      .insertInto("groupMemberships")
      .values({
        groupId,
        userId,
        role: "MEMBER",
        permissions: normalizeGroupPermissions(invitation.permissions),
        addedBy: invitation.inviterId,
      })
      .execute()
    await trx
      .updateTable("groupInvitations")
      .set({ status: "ACCEPTED" })
      .where("id", "=", invitationId)
      .execute()

    return { ok: true } as const
  })

  return { ...result, groupId }
}

/** Closes a pending invitation sent to the user. */
export const declineGroupInvitation = async (
  db: Kysely<DB>,
  { invitationId, userId }: { invitationId: string; userId: string },
) => {
  const invitation = await db
    .selectFrom("groupInvitations")
    .select(["status", "groupId"])
    .where("id", "=", invitationId)
    .where("inviteeId", "=", userId)
    .forUpdate()
    .executeTakeFirst()

  if (invitation === undefined) {
    return { ok: false, error: "GROUP_INVITATION_NOT_FOUND", groupId: null } as const
  }

  if (invitation.status !== "PENDING") {
    return {
      ok: false,
      error: "GROUP_INVITATION_NOT_PENDING",
      groupId: invitation.groupId,
    } as const
  }

  await db
    .updateTable("groupInvitations")
    .set({ status: "DECLINED" })
    .where("id", "=", invitationId)
    .execute()

  return { ok: true, groupId: invitation.groupId } as const
}
