import type { DB, Kysely } from "@taiyomoe/db"
import { isGroupNameTaken } from "./group-names"

/** Creates the requested group and makes the requester its owner. */
export const approveGroupCreationRequest = async (
  db: Kysely<DB>,
  { requestId, reviewerId }: { requestId: string; reviewerId: string },
) => {
  const request = await db
    .selectFrom("groupCreationRequests")
    .select(["status", "userId", "name", "description"])
    .where("id", "=", requestId)
    .forUpdate()
    .executeTakeFirst()

  if (request === undefined) {
    return { ok: false, error: "GROUP_CREATION_REQUEST_NOT_FOUND" } as const
  }

  if (request.status !== "PENDING") {
    return { ok: false, error: "GROUP_CREATION_REQUEST_NOT_PENDING" } as const
  }

  if (await isGroupNameTaken(db, request.name)) {
    return { ok: false, error: "GROUP_NAME_TAKEN" } as const
  }

  const groupId = crypto.randomUUID()

  await db
    .insertInto("groups")
    .values({
      id: groupId,
      name: request.name,
      description: request.description,
      creatorId: reviewerId,
    })
    .execute()
  await db
    .insertInto("groupMemberships")
    .values({ groupId, userId: request.userId, role: "OWNER", addedBy: reviewerId })
    .execute()
  await db
    .updateTable("groupCreationRequests")
    .set({ status: "APPROVED", reviewerId, groupId })
    .where("id", "=", requestId)
    .execute()

  return { ok: true, groupId, userId: request.userId, name: request.name } as const
}

/** Closes a pending request with the note shown to its requester. */
export const rejectGroupCreationRequest = async (
  db: Kysely<DB>,
  { requestId, reviewerId, note }: { requestId: string; reviewerId: string; note: string },
) => {
  const transitioned = await db
    .updateTable("groupCreationRequests")
    .set({ status: "REJECTED", reviewerId, reviewerNote: note })
    .where("id", "=", requestId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return transitioned === undefined
    ? ({ ok: false, error: "GROUP_CREATION_REQUEST_NOT_PENDING" } as const)
    : ({ ok: true } as const)
}

/** Withdraws a pending request; the caller checks it was filed by the user. */
export const cancelGroupCreationRequest = async (db: Kysely<DB>, requestId: string) => {
  const transitioned = await db
    .updateTable("groupCreationRequests")
    .set({ status: "CANCELLED" })
    .where("id", "=", requestId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return transitioned === undefined
    ? ({ ok: false, error: "GROUP_CREATION_REQUEST_NOT_PENDING" } as const)
    : ({ ok: true } as const)
}
