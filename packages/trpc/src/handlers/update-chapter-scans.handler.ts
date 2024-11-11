import { ChaptersIndexService } from "@taiyomoe/meilisearch/services"
import { bulkUpdateChaptersScansSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateChapterScansHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "update" })
  .input(bulkUpdateChaptersScansSchema)
  .mutation(async ({ ctx, input: { scans: input } }) => {
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

    const scanIds = [...new Set(input.flatMap((c) => c.scanIds))]
    const scans = await ctx.db.scan.findMany({
      where: { id: { in: scanIds } },
    })

    if (scans.length !== scanIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uma ou várias scans não existem.",
      })
    }

    if (
      (input.some((c) => c.scanIds.length === 0) &&
        input.some((c) => c.ids.length === 0)) ||
      input.some((c) => c.ids.length === 0)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Você tem que selecionar pelo menos 1 capítulo.",
      })
    }

    const mutations = []
    for (const chapterId of chapterIds) {
      mutations.push(
        ctx.db.mediaChapter.update({
          data: { scans: { set: [] } },
          where: { id: chapterId },
        }),
      )
    }

    for (const chapters of input) {
      for (const chapterId of chapters.ids) {
        mutations.push(
          ctx.db.mediaChapter.update({
            data: {
              scans: {
                connect: chapters.scanIds.map((scanId) => ({ id: scanId })),
              },
            },
            where: { id: chapterId },
          }),
        )
      }
    }

    await ctx.db.$transaction(mutations)

    const newChapters = await ctx.db.mediaChapter.findMany({
      where: { id: { in: chapters.map((c) => c.id) } },
    })

    for (const chapterId of chapters.map((c) => c.id)) {
      await ctx.logs.chapters.insert({
        type: "updated",
        old: chapters.find((c) => c.id === chapterId)!,
        _new: newChapters.find((c) => c.id === chapterId)!,
        userId: ctx.session.user.id,
      })
    }

    await ChaptersIndexService.sync(
      ctx.db,
      newChapters.map((c) => c.id),
    )
  })
