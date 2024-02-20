import {
  createMediaCoversSchema,
  deleteMediaCoverSchema,
  updateMediaCoverSchema,
} from "@taiyomoe/schemas"
import { MediaService } from "@taiyomoe/services"
import { TRPCError } from "@trpc/server"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const mediaCoversRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "mediaCovers", action: "create" })
    .input(createMediaCoversSchema)
    .mutation(async ({ ctx, input: { mediaId, covers } }) => {
      if (covers.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must provide at least one cover.",
        })
      }

      await ctx.db.mediaCover.createMany({
        data: covers.map((c) => ({
          ...c,
          mediaId,
          uploaderId: ctx.session.user.id,
        })),
      })

      // If there's a main cover, set it as the main cover
      if (covers.some((c) => c.isMainCover)) {
        await ctx.db.mediaCover.updateMany({
          data: { isMainCover: false },
          where: {
            mediaId,
            id: { notIn: covers.map((c) => c.id) },
          },
        })

        const indexItem = await MediaService.getIndexItem(mediaId)
        await ctx.indexes.medias.updateDocuments([indexItem])
      }

      const createdCovers = await ctx.db.mediaCover.findMany({
        where: { mediaId, id: { in: covers.map((c) => c.id) } },
        orderBy: { createdAt: "asc" },
      })

      return createdCovers
    }),

  update: protectedProcedure
    .meta({ resource: "mediaCovers", action: "update" })
    .input(updateMediaCoverSchema)
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

        const indexItem = await MediaService.getIndexItem(cover.mediaId)
        await ctx.indexes.medias.updateDocuments([indexItem])
      }
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaCovers", action: "delete" })
    .input(deleteMediaCoverSchema)
    .mutation(async ({ ctx, input }) => {
      const cover = await ctx.db.mediaCover.findUnique({
        where: { id: input.id },
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
        where: { id: input.id },
      })
    }),
})
