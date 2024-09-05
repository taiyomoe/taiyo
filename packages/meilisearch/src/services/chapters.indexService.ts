import type { MediaChapter, PrismaClient } from "@prisma/client"
import type { ChaptersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit } from "radash"

const getItem = async (
  db: PrismaClient,
  chapterId: string,
): Promise<ChaptersIndexItem> => {
  const result = await db.mediaChapter.findUnique({
    omit: { pages: true },
    include: { scans: { select: { id: true } } },
    where: { id: chapterId },
  })

  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Chapter '${chapterId}' not found`,
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
  }
}

export const ChaptersIndexService = {
  getItem,
  bulkDelete,
}
