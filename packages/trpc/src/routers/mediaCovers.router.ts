import { idSchema, updateCoverSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"

import { getMediaIndexItem } from "@taiyomoe/meilisearch/utils"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const mediaCoversRouter = createTRPCRouter({
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

      const updatedCover = await ctx.db.mediaCover.update({
        data: input,
        where: { id: input.id },
      })

      if (input.isMainCover) {
        await ctx.db.mediaCover.updateMany({
          data: { isMainCover: false },
          where: {
            mediaId: updatedCover.mediaId,
            id: { not: input.id },
          },
        })

        const indexItem = await getMediaIndexItem(ctx.db, cover.mediaId)
        await ctx.indexes.medias.updateDocuments([indexItem])
      }
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

      await ctx.db.mediaCover.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input },
      })
    }),
})
