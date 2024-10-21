import { DEFAULT_GROUPED_CHAPTERS_LIMIT } from "@taiyomoe/constants"
import { getChaptersByUserIdSchema } from "@taiyomoe/schemas"
import type { LatestReleaseGrouped } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { publicProcedure } from "../trpc"

export const getChaptersByUserIdHandler = publicProcedure
  .input(getChaptersByUserIdSchema)
  .query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      select: { id: true, name: true },
      where: { id: input.userId },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    const history = ctx.session?.user.id
      ? ((await ctx.db.userHistory.findFirst({
          where: { mediaId: input.mediaId, userId: ctx.session.user.id },
          select: { progression: true },
        })) ?? { progression: [] })
      : { progression: [] }

    const chapters = await ctx.db.mediaChapter.findMany({
      select: {
        id: true,
        createdAt: true,
        number: true,
        volume: true,
        title: true,
        scans: { select: { id: true, name: true } },
      },
      where: { mediaId: input.mediaId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: DEFAULT_GROUPED_CHAPTERS_LIMIT,
    })

    return chapters.map((c) => ({
      ...c,
      completed: history.progression.some(
        (p) => p.chapterId === c.id && p.completed,
      ),
      uploader: user,
    })) satisfies LatestReleaseGrouped["chapters"]
  })
