import type { PrismaClient } from "@prisma/client"
import type { ChaptersIndexItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { omit } from "radash"

export const getChapterIndexItem = async (
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
    ...omit(result, ["scans"]),
    scanIds: result.scans.map((s) => s.id),
  }
}
