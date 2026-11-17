import type { DB, Kysely } from "@taiyomoe/db"
import { claimGroup, withGroupLock } from "../group-membership"

/**
 * Makes the requester an owner of the group and cancels the other pending requests on it.
 * The group is locked before the request, like every approval and every claim on the group.
 */
export const approveOwnershipRequest = async (
  db: Kysely<DB>,
  { requestId, reviewerId }: { requestId: string; reviewerId: string },
) => {
  const request = await db
    .selectFrom("groupOwnershipRequests")
    .select(["id", "groupId", "userId", "status"])
    .where("id", "=", requestId)
    .executeTakeFirst()

  if (request === undefined) {
    return { ok: false, error: "OWNERSHIP_REQUEST_NOT_FOUND" } as const
  }

  if (request.status !== "PENDING") {
    return { ok: false, error: "OWNERSHIP_REQUEST_NOT_PENDING" } as const
  }

  return withGroupLock(db, request.groupId, async (trx) => {
    const current = await trx
      .selectFrom("groupOwnershipRequests")
      .select("status")
      .where("id", "=", request.id)
      .forUpdate()
      .executeTakeFirstOrThrow()

    if (current.status !== "PENDING") {
      return { ok: false, error: "OWNERSHIP_REQUEST_NOT_PENDING" } as const
    }

    const claimed = await claimGroup(trx, {
      groupId: request.groupId,
      userId: request.userId,
      addedBy: reviewerId,
    })

    if (!claimed.ok) {
      return claimed
    }

    await trx
      .updateTable("groupOwnershipRequests")
      .set({ status: "APPROVED", reviewerId })
      .where("id", "=", request.id)
      .execute()
    await trx
      .updateTable("groupOwnershipRequests")
      .set({ status: "CANCELLED" })
      .where("groupId", "=", request.groupId)
      .where("status", "=", "PENDING")
      .where("id", "!=", request.id)
      .execute()

    return { ok: true } as const
  })
}

/** Closes a pending request with the note shown to its requester. */
export const rejectOwnershipRequest = async (
  db: Kysely<DB>,
  { requestId, reviewerId, note }: { requestId: string; reviewerId: string; note: string },
) => {
  const transitioned = await db
    .updateTable("groupOwnershipRequests")
    .set({ status: "REJECTED", reviewerId, reviewerNote: note })
    .where("id", "=", requestId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return transitioned === undefined
    ? ({ ok: false, error: "OWNERSHIP_REQUEST_NOT_PENDING" } as const)
    : ({ ok: true } as const)
}

/** Withdraws a pending request; the caller checks it was filed by the user. */
export const cancelOwnershipRequest = async (db: Kysely<DB>, requestId: string) => {
  const transitioned = await db
    .updateTable("groupOwnershipRequests")
    .set({ status: "CANCELLED" })
    .where("id", "=", requestId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return transitioned === undefined
    ? ({ ok: false, error: "OWNERSHIP_REQUEST_NOT_PENDING" } as const)
    : ({ ok: true } as const)
}
