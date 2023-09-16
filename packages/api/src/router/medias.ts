import { z } from "zod";

import type { MediasWithCovers, MediaWithRelations } from "@taiyo/db";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediasRouter = createTRPCRouter({
  getLatestMedias: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.medias.findMany({
      with: {
        covers: true,
      },
      limit: 20,
      orderBy: (m, { desc }) => desc(m.createdAt),
    });

    return result as MediasWithCovers;
  }),
  getMediaById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: mediaId }) => {
      const result = await ctx.db.query.medias.findFirst({
        where: (m, { eq }) => eq(m.id, mediaId),
        with: {
          covers: {
            limit: 1,
          },
          banners: {
            limit: 1,
          },
          titles: true,
          chapters: true,
        },
      });

      return result as MediaWithRelations;
    }),
});
