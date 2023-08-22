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

    return result;
  }),
});
