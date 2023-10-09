import { z } from "zod";

import { db } from "@taiyo/db";
import type { MediasWithCovers, MediaWithRelations } from "@taiyo/db/types";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediasRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: mediaId }) => {
      const result = await db.query.medias.findFirst({
        where: (m, { eq }) => eq(m.id, mediaId),
        with: {
          covers: {
            limit: 1,
          },
          banners: {
            limit: 1,
          },
          titles: true,
          chapters: {
            with: {
              user: true,
            },
          },
        },
      });

      return result as MediaWithRelations;
    }),
  getLatestMedias: publicProcedure.query(async () => {
    const result = await db.query.medias.findMany({
      with: {
        covers: true,
      },
      limit: 20,
      orderBy: (m, { desc }) => desc(m.createdAt),
    });

    return result as MediasWithCovers;
  }),
});
