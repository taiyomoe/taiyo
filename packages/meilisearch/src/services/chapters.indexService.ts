import type { PrismaClient } from "@prisma/client"
import type { ChaptersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel } from "radash"
import { meilisearchClient } from "../"

const getItem = async (db: PrismaClient, id: string) => {
  const result = await db.mediaChapter.findUnique({
    omit: { pages: true },
    include: { scans: { select: { id: true } } },
    where: { id },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Chapter '${id}' not found`,
    })
  }

  return {
    ...omit(result, ["createdAt", "updatedAt", "deletedAt", "scans"]),
    createdAt: DateTime.fromJSDate(result.createdAt).toSeconds(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).toSeconds(),
    deletedAt: result.deletedAt
      ? DateTime.fromJSDate(result.deletedAt).toSeconds()
      : null,
    scanIds: result.scans.map((s) => s.id),
  } satisfies ChaptersIndexItem
}

const sync = async (db: PrismaClient, ids: string[]) => {
  const chapters = await parallel(10, ids, (id) => getItem(db, id))

  return meilisearchClient.chapters.updateDocuments(chapters)
}

export const ChaptersIndexService = {
  getItem,
  sync,
}
