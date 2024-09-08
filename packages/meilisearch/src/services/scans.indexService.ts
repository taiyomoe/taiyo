import type { PrismaClient, Scan } from "@prisma/client"
import type { ScansIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit } from "radash"
import { meilisearchClient } from "../"

const getItem = async (
  db: PrismaClient,
  scanId: string,
): Promise<ScansIndexItem> => {
  const result = await db.scan.findUnique({ where: { id: scanId } })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Scan '${scanId}' not found`,
    })
  }

  return {
    ...omit(result, ["createdAt", "updatedAt", "deletedAt"]),
    createdAt: DateTime.fromJSDate(result.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).toSeconds(),
    deletedAt: result.deletedAt
      ? DateTime.fromJSDate(result.deletedAt).toSeconds()
      : null,
  }
}

const bulkMutate = (rawScans: Scan[]) => {
  const scans = rawScans.map((c) => ({
    ...omit(c, ["createdAt", "updatedAt", "deletedAt"]),
    createdAt: DateTime.fromJSDate(c.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(c.updatedAt).toSeconds(),
    deletedAt: c.deletedAt
      ? DateTime.fromJSDate(c.deletedAt).toSeconds()
      : null,
  }))

  return meilisearchClient.scans.updateDocuments(scans)
}

export const ScansIndexService = {
  getItem,
  bulkMutate,
}
