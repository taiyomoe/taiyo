import { getMediaChaptersByMediaIdSchema } from "@taiyomoe/schemas"
import { publicProcedure } from "../trpc"

export const getChapterByMediaIdHandler = publicProcedure
  .input(getMediaChaptersByMediaIdSchema)
  .query(async ({ ctx, input: { mediaId, page, perPage } }) => {
    const result = await ctx.db.mediaChapter.findMany({
      select: {
        id: true,
        createdAt: true,
        title: true,
        number: true,
        volume: true,
        uploader: { select: { id: true, name: true } },
        scans: { select: { id: true, name: true } },
      },
      where: { mediaId, deletedAt: null },
      orderBy: { number: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    })
    const chaptersCount = await ctx.db.mediaChapter.count({
      where: { mediaId, deletedAt: null },
    })
    const { progression } = ctx.session
      ? ((await ctx.db.userHistory.findFirst({
          select: { progression: true },
          where: { userId: ctx.session?.user.id, mediaId },
        })) ?? { progression: [] })
      : { progression: [] }

    const mediaLimitedChapterPagination = {
      chapters: result.map((c) => ({
        id: c.id,
        createdAt: c.createdAt,
        title: c.title,
        number: c.number,
        volume: c.volume,
        // ----- USER PROGRESSION
        completed:
          progression.find((p) => p.chapterId === c.id)?.completed ?? null,
        // ----- RELATIONS
        uploader: {
          id: c.uploader.id,
          name: c.uploader.name,
        },
        scans: c.scans,
      })),
      // ----- OTHERS
      totalPages: Math.ceil(chaptersCount / perPage) || 1,
    }

    return mediaLimitedChapterPagination
  })
