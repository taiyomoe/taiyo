import { bulkMutateSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const bulkMutateChaptersHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "update" })
  .input(bulkMutateSchema)
  .mutation(async ({ ctx, input }) => {
    const chapters = await ctx.db.mediaChapter.findMany({
      where: { id: { in: input.ids } },
    })

    if (chapters.length !== input.ids.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Um ou vários capítulos não existem.",
      })
    }

    if (input.type === "restore") {
      if (chapters.some((c) => c.deletedAt === null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Alguns capítulos não estão deletados.",
        })
      }
    }

    if (input.type === "delete") {
      if (chapters.some((c) => c.deletedAt !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Alguns capítulos já estão deletados.",
        })
      }
    }

    const newDeletedAt = input.type === "delete" ? new Date() : null
    const newDeleterId = input.type === "delete" ? ctx.session.user.id : null
    const newChapters = chapters.map((c) => ({
      ...c,
      deletedAt: newDeletedAt,
      deleterId: newDeleterId,
    }))

    await ctx.db.mediaChapter.updateMany({
      data: { deletedAt: newDeletedAt, deleterId: newDeleterId },
      where: { id: { in: input.ids } },
    })

    if (input.type === "restore") {
      await ctx.services.chapters.postRestore(newChapters, ctx.session.user.id)

      return
    }

    await ctx.services.chapters.postDelete(newChapters, ctx.session.user.id)
  })
