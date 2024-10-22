import type { MediaChapter } from "@taiyomoe/db"
import { bulkMutateSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { group, parallel } from "radash"
import { protectedProcedure } from "../trpc"

export const bulkMutateMediasHandler = protectedProcedure
  .meta({ resource: "medias", action: "update" })
  .input(bulkMutateSchema)
  .mutation(async ({ ctx, input }) => {
    const medias = await ctx.db.media.findMany({
      where: { id: { in: input.ids } },
    })

    if (medias.length !== input.ids.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Um ou vários capítulos não existem.",
      })
    }

    if (input.type === "restore") {
      if (medias.some((m) => m.deletedAt === null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Algumas obras não estão deletadas.",
        })
      }
    }

    if (input.type === "delete") {
      if (medias.some((m) => m.deletedAt !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Algumas obras já estão deletadas.",
        })
      }
    }

    const newDeletedAt = input.type === "delete" ? new Date() : null
    const newDeleterId = input.type === "delete" ? ctx.session.user.id : null
    const newMedias = medias.map((m) => ({
      ...m,
      deletedAt: newDeletedAt,
      deleterId: newDeleterId,
    }))
    const rawChapters = await parallel(10, medias, (m) =>
      ctx.db.mediaChapter.findMany({
        where: { mediaId: m.id },
      }),
    )
    const chapters = group(rawChapters.flat(), (c) => c.mediaId) as Record<
      string,
      MediaChapter[]
    >

    await ctx.db.media.updateMany({
      data: { deletedAt: newDeletedAt, deleterId: newDeleterId },
      where: { id: { in: input.ids } },
    })

    if (input.type === "restore") {
      await ctx.services.medias.postRestore(
        newMedias,
        chapters,
        ctx.session.user.id,
      )

      return
    }

    await ctx.services.medias.postDelete(newMedias, chapters)
  })
