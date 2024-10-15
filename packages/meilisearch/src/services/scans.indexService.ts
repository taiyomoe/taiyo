import type { PrismaClient } from "@prisma/client"
import type { ScansIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel } from "radash"
import { meilisearchClient } from "~/index"

const getItem = async (db: PrismaClient, id: string) => {
  const result = await db.scan.findUnique({ where: { id } })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Scan '${id}' not found`,
    })
  }

  return {
    ...omit(result, ["createdAt", "updatedAt", "deletedAt"]),
    createdAt: DateTime.fromJSDate(result.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).toSeconds(),
    deletedAt: result.deletedAt
      ? DateTime.fromJSDate(result.deletedAt).toSeconds()
      : null,
  } satisfies ScansIndexItem
}

const sync = async (db: PrismaClient, ids: string[]) => {
  const scans = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.scans.updateDocuments(scans)
}

export const ScansIndexService = {
  getItem,
  sync,
}
