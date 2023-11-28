import { updateProgressionSchema } from "~/lib/schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const historyRouter = createTRPCRouter({
  updateProgression: protectedProcedure
    .meta({
      resource: "history",
      action: "update",
    })
    .input(updateProgressionSchema)
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.mediaChapter.findUnique({
        select: { mediaId: true, pages: true },
        where: { id: input.chapterId },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      const page = chapter.pages.find((p) => p.id === input.pageId);

      if (!page) {
        throw new Error("Page not found");
      }

      const mediaId_userId = {
        mediaId: chapter.mediaId,
        userId: ctx.session.user.id,
      };
      const historyEntry = await ctx.db.userHistory.findUnique({
        where: { mediaId_userId },
      });
      const progression = historyEntry?.progression ?? [];

      const entryIndex = progression.findIndex(
        (p) => p.chapterId === input.chapterId,
      );

      if (entryIndex >= 0) {
        progression.splice(entryIndex, 1);
      }

      progression.push({
        updatedAt: new Date().toISOString(),
        chapterId: input.chapterId,
        pageId: input.pageId,
      });

      await ctx.db.userHistory.upsert({
        where: { mediaId_userId },
        update: {
          progression: {
            set: progression,
          },
        },
        create: {
          mediaId: chapter.mediaId,
          userId: ctx.session.user.id,
          progression,
        },
      });
    }),
});
