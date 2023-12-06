import { TRPCError } from "@trpc/server";

import { updateMediaCoverSchema } from "~/lib/schemas/mediaCover.schemas";
import { MediaService } from "~/lib/services";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mediaCoversRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "mediaCovers", action: "update" })
    .input(updateMediaCoverSchema)
    .mutation(async ({ ctx, input }) => {
      const cover = await ctx.db.mediaCover.findUnique({
        where: { id: input.id },
      });

      if (!cover) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media cover not found",
        });
      }

      if (input.isMainCover === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You cannot remove the main cover. If you want to remove it, set another cover as the main one.",
        });
      }

      const updatedCover = await ctx.db.mediaCover.update({
        data: input,
        where: { id: input.id },
      });

      if (input.isMainCover) {
        await ctx.db.mediaCover.updateMany({
          data: { isMainCover: false },
          where: {
            mediaId: updatedCover.mediaId,
            id: { not: input.id },
          },
        });

        const indexItem = await MediaService.getIndexItem(cover.mediaId);
        await ctx.indexes.medias.updateDocuments([indexItem]);
      }
    }),
});
