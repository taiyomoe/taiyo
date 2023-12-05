import { updateMediaCoverSchema } from "~/lib/schemas/mediaCover.schemas";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mediaCoversRouter = createTRPCRouter({
  update: protectedProcedure
    .meta({ resource: "mediaCovers", action: "update" })
    .input(updateMediaCoverSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.mediaCover.update({
        data: input,
        where: { id: input.id },
      });
    }),
});
