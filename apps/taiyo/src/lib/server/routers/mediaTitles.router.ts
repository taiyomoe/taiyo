import {
  createMediaTitleSchema,
  updateMediaTitleSchema,
} from "@taiyomoe/schemas"
import { MediaService } from "@taiyomoe/services"
import { TRPCError } from "@trpc/server"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const mediaTitlesRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "mediaTitles", action: "create" })
    .input(createMediaTitleSchema)
    .mutation(async ({ ctx, input }) => {
      const titles = await ctx.db.mediaTitle.findMany({
        where: { mediaId: input.mediaId },
      })

      if (
        titles.some(
          (t) =>
            t.title.toLowerCase() === input.title.toLowerCase() &&
            t.language === input.language,
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A title with the same language already exists.",
        })
      }

      if (
        titles.some(
          (t) => t.language === input.language && t.priority === input.priority,
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "A title with the same language and priority already exists.",
        })
      }

      const createdTitle = await ctx.db.mediaTitle.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      })

      if (input.isMainTitle) {
        await ctx.db.mediaTitle.updateMany({
          data: { isMainTitle: false },
          where: {
            id: { not: createdTitle.id },
            mediaId: input.mediaId,
          },
        })
      }

      const indexItem = await MediaService.getIndexItem(input.mediaId)
      await ctx.indexes.medias.updateDocuments([indexItem])

      return createdTitle
    }),

  update: protectedProcedure
    .meta({ resource: "mediaTitles", action: "update" })
    .input(updateMediaTitleSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.isMainTitle === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main title. If you want to remove it, set another title as the main one.",
        })
      }

      const title = await ctx.db.mediaTitle.findUnique({
        where: { id: input.id },
      })

      if (!title) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media title not found",
        })
      }

      const titles = await ctx.db.mediaTitle.findMany({
        where: { mediaId: title.mediaId },
      })

      // If there is already a title with the same language and title
      if (
        titles.some(
          (t) =>
            t.title.toLowerCase() === title.title.toLowerCase() &&
            t.language === title.language &&
            t.id !== input.id,
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A title with the same language already exists.",
        })
      }

      await ctx.db.mediaTitle.update({
        data: input,
        where: { id: input.id },
      })

      if (input.isMainTitle) {
        await ctx.db.mediaTitle.updateMany({
          data: { isMainTitle: false },
          where: {
            id: { not: input.id },
            mediaId: title.mediaId,
          },
        })
      }

      const indexItem = await MediaService.getIndexItem(title.mediaId)
      await ctx.indexes.medias.updateDocuments([indexItem])
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaTitles", action: "delete" })
    .input(updateMediaTitleSchema)
    .mutation(async ({ ctx, input }) => {
      const title = await ctx.db.mediaTitle.findUnique({
        where: { id: input.id },
      })

      if (!title) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media title not found",
        })
      }

      if (title.isMainTitle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main title. If you want to remove it, set another title as the main one first.",
        })
      }

      await ctx.db.mediaTitle.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input.id },
      })

      const indexItem = await MediaService.getIndexItem(title.mediaId)
      await ctx.indexes.medias.updateDocuments([indexItem])
    }),
})
