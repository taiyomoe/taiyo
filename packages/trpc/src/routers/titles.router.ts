import {
  createTitleSchema,
  idSchema,
  updateTitleSchema,
} from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const titlesRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "mediaTitles", action: "create" })
    .input(createTitleSchema)
    .mutation(async ({ ctx, input }) => {
      const titles = await ctx.db.mediaTitle.findMany({
        where: { mediaId: input.mediaId },
      })
      const mainTitle = titles.find((t) => t.isMainTitle)!

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

      const result = await ctx.db.$transaction(async (tx) => {
        const result = await ctx.db.mediaTitle.create({
          data: {
            ...input,
            creatorId: ctx.session.user.id,
          },
        })
        const oldMainTitle = input.isMainTitle
          ? await tx.mediaTitle.update({
              data: { isMainTitle: false },
              where: { id: mainTitle.id },
            })
          : null

        return { new: result, old: oldMainTitle }
      })

      await ctx.services.titles.postCreate(ctx.db, "created", [result.new])

      return result.new
    }),

  update: protectedProcedure
    .meta({ resource: "mediaTitles", action: "update" })
    .input(updateTitleSchema)
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
      const mainTitle = titles.find((t) => t.isMainTitle)!

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

      const result = await ctx.db.$transaction(async (tx) => {
        const result = await ctx.db.mediaTitle.update({
          data: input,
          where: { id: input.id },
        })
        const oldMainTitle = input.isMainTitle
          ? await tx.mediaTitle.update({
              data: { isMainTitle: false },
              where: { id: mainTitle.id },
            })
          : null

        return { new: result, old: oldMainTitle }
      })

      if (input.isMainTitle && result.old) {
        await ctx.services.titles.postUpdate(
          "updated",
          mainTitle,
          result.old,
          ctx.session.user.id,
        )
      }

      await ctx.services.titles.postUpdate(
        "updated",
        title,
        result.new,
        ctx.session.user.id,
      )
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaTitles", action: "delete" })
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const title = await ctx.db.mediaTitle.findUnique({
        where: { id: input },
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

      const result = await ctx.db.mediaTitle.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input },
      })

      await ctx.services.titles.postDelete(result)
    }),
})
