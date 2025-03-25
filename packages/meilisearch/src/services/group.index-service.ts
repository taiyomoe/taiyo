import type { Prisma, PrismaClient } from "@prisma/client"
import type { GroupsIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel } from "radash"
import { meilisearchClient } from ".."

const getItem = async (
  db: PrismaClient | Prisma.TransactionClient,
  id: string,
) => {
  const result = await db.group.findUnique({ where: { id } })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Group '${id}' not found`,
    })
  }

  return {
    ...omit(result, ["createdAt", "updatedAt", "deletedAt"]),
    createdAt: DateTime.fromJSDate(result.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).toSeconds(),
    deletedAt: result.deletedAt
      ? DateTime.fromJSDate(result.deletedAt).toSeconds()
      : null,
  } satisfies GroupsIndexItem
}

const sync = async (
  db: PrismaClient | Prisma.TransactionClient,
  ids: string[],
) => {
  const groups = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.groups.updateDocuments(groups)
}

export const GroupsIndexService = {
  getItem,
  sync,
}
