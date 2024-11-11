import { bulkUpdateChaptersVolumesSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateChapterVolumesHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "update" })
  .input(bulkUpdateChaptersVolumesSchema)
  .mutation(async ({ ctx, input: { volumes: input } }) => {
    const chapterIds = [...new Set(input.flatMap((c) => c.ids))]
    const chapters = await ctx.db.mediaChapter.findMany({
      where: { id: { in: chapterIds } },
    })

    if (chapters.length !== chapterIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Um ou vários capítulos não existem.",
      })
    }

    for (const chptrs of input) {
      await ctx.db.mediaChapter.updateMany({
        data: { volume: chptrs.number },
        where: { id: { in: chptrs.ids } },
      })

      const newChapters = await ctx.db.mediaChapter.findMany({
        where: { id: { in: chptrs.ids } },
      })

      await ctx.services.chapters.postUpdate(
        chapters,
        newChapters,
        ctx.session.user.id,
      )
    }
  })
