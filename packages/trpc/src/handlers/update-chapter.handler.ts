import { updateChapterSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const updateChapterHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "update" })
  .input(updateChapterSchema)
  .mutation(async ({ ctx, input: { scanIds, ...input } }) => {
    const chapter = await ctx.db.mediaChapter.findUnique({
      include: { scans: true },
      where: { id: input.id, deletedAt: null },
    })

    if (!chapter) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media chapter not found",
      })
    }

    const scans = await ctx.db.scan.findMany({
      where: { id: { in: scanIds } },
    })

    if (scans.length !== scanIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Uma ou várias scans não existem.",
      })
    }

    const result = await ctx.db.mediaChapter.update({
      data: {
        ...input,
        title: input.title === "" ? null : input.title,
        scans: { set: scanIds.map((scanId) => ({ id: scanId })) },
      },
      where: { id: input.id },
    })

    await ctx.services.chapters.postUpdate(
      [chapter],
      [result],
      ctx.session.user.id,
    )

    return result
  })
