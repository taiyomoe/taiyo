import type { Prisma, PrismaClient } from "@prisma/client"
import type { GroupsIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit } from "radash"

export const getGroupIndexItem = async (
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
