import { idSchema, updateCoverSchema } from "@taiyomoe/schemas"
import { CoversService } from "@taiyomoe/services"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const coversRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "mediaCovers", action: "update" })
    .input(updateCoverSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.isMainCover === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main cover. If you want to remove it, set another cover as the main one.",
        })
      }

      const cover = await ctx.db.mediaCover.findUnique({
        where: { id: input.id },
      })

      if (!cover) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media cover not found",
        })
      }

      const mainCover = await ctx.db.mediaCover.findFirst({
        where: { mediaId: cover.mediaId, isMainCover: true },
      })

      if (!mainCover) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media cover not found",
        })
      }

      const result = await ctx.db.$transaction(async (tx) => {
        const result = await ctx.db.mediaCover.update({
          data: input,
          where: { id: input.id },
        })

        if (input.isMainCover) {
          await tx.mediaCover.update({
            data: { isMainCover: false },
            where: { id: mainCover.id },
          })
        }

        return result
      })

      await CoversService.postUpdate(
        cover,
        result,
        input.isMainCover ? mainCover : null,
        ctx.session.user.id,
      )
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaCovers", action: "delete" })
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const cover = await ctx.db.mediaCover.findUnique({
        where: { id: input },
      })

      if (!cover) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media cover not found",
        })
      }

      if (cover.isMainCover) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot delete the main cover. If you want to delete it, set another cover as the main one first.",
        })
      }

      const result = await ctx.db.mediaCover.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input },
      })

      await CoversService.postDelete([result], ctx.session.user.id)
    }),
})
