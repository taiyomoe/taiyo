import { TRPCError } from "@trpc/server";

import { updateMediaTitleSchema } from "~/lib/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mediaTitlesRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "mediaTitles", action: "update" })
    .input(updateMediaTitleSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.isMainTitle === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main title. If you want to remove it, set another title as the main one.",
        });
      }

      const title = await ctx.db.mediaTitle.findUnique({
        where: { id: input.id },
      });

      if (!title) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media title not found",
        });
      }

      const titles = await ctx.db.mediaTitle.findMany({
        where: { mediaId: title.mediaId },
      });

      // If there is already a title with the same language and title
      if (
        titles.some(
          (t) =>
            t.title === title.title &&
            t.language === title.language &&
            t.id !== input.id,
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A title with the same language already exists.",
        });
      }

      await ctx.db.mediaTitle.update({
        data: input,
        where: { id: input.id },
      });

      if (input.isMainTitle) {
        await ctx.db.mediaTitle.updateMany({
          data: { isMainTitle: false },
          where: {
            id: { not: input.id },
            mediaId: title.mediaId,
          },
        });
      }
    }),

  delete: protectedProcedure
    .meta({ resource: "mediaTitles", action: "delete" })
    .input(updateMediaTitleSchema)
    .mutation(async ({ ctx, input }) => {
      const title = await ctx.db.mediaTitle.findUnique({
        where: { id: input.id },
      });

      if (!title) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media title not found",
        });
      }

      if (title.isMainTitle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main title. If you want to remove it, set another title as the main one first.",
        });
      }

      await ctx.db.mediaTitle.update({
        data: { deletedAt: new Date(), deleterId: ctx.session.user.id },
        where: { id: input.id },
      });
    }),
});
